import { createLogger } from "../core/logging";
import { STOP_PROPAGATION } from "../core/signal";
import { round2Digits } from "../core/utils";
import {
    enumDirection,
    enumDirectionToAngle,
    enumDirectionToVector,
    enumInvertedDirections,
    Vector,
} from "../core/vector";
import { Entity } from "./entity";
import { MetaBuilding } from "./meta_building";
import { enumLayer, GameRoot } from "./root";

const logger = createLogger("ingame/logic");

/** @enum {number} */
export const enumWireEdgeFlag = {
    empty: 0,
    filled: 1,
    connected: 2,
};

/**
 * Typing helper
 * @typedef {Array<{
 *  entity: Entity,
 *  slot: import("./components/item_ejector").ItemEjectorSlot,
 *  fromTile: Vector,
 *  toDirection: enumDirection
 * }>} EjectorsAffectingTile
 */

/**
 * Typing helper
 * @typedef {Array<{
 *  entity: Entity,
 *  slot: import("./components/item_acceptor").ItemAcceptorSlot,
 *  toTile: Vector,
 *  fromDirection: enumDirection
 * }>} AcceptorsAffectingTile
 */

/**
 * @typedef {{
 *     acceptors: AcceptorsAffectingTile,
 *     ejectors: EjectorsAffectingTile
 * }} AcceptorsAndEjectorsAffectingTile
 */

export class GameLogic {
    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;
    }

    /**
     * Checks if the given entity can be placed
     * @param {Entity} entity
     * @param {Vector=} offset Optional, move the entity by the given offset first
     * @returns {boolean} true if the entity could be placed there
     */
    checkCanPlaceEntity(entity, offset = null) {
        // Compute area of the building
        const rect = entity.components.StaticMapEntity.getTileSpaceBounds();
        if (offset) {
            rect.x += offset.x;
            rect.y += offset.y;
        }

        // Check the whole area of the building
        for (let x = rect.x; x < rect.x + rect.w; ++x) {
            for (let y = rect.y; y < rect.y + rect.h; ++y) {
                // Check if there is any direct collision
                const otherEntity = this.root.map.getLayerContentXY(x, y, entity.layer);
                if (otherEntity) {
                    const metaClass = otherEntity.components.StaticMapEntity.getMetaBuilding();
                    if (!metaClass.getIsReplaceable()) {
                        // This one is a direct blocker
                        return false;
                    }
                }
            }
        }

        // Perform additional placement checks
        if (this.root.signals.prePlacementCheck.dispatch(entity, offset) === STOP_PROPAGATION) {
            return false;
        }

        return true;
    }

    /**
     * Attempts to place the given building
     * @param {object} param0
     * @param {Vector} param0.origin
     * @param {number} param0.rotation
     * @param {number} param0.originalRotation
     * @param {number} param0.rotationVariant
     * @param {string} param0.variant
     * @param {MetaBuilding} param0.building
     * @returns {Entity}
     */
    tryPlaceBuilding({ origin, rotation, rotationVariant, originalRotation, variant, building }) {
        const entity = building.createEntity({
            root: this.root,
            origin,
            rotation,
            originalRotation,
            rotationVariant,
            variant,
        });
        if (this.checkCanPlaceEntity(entity)) {
            this.freeEntityAreaBeforeBuild(entity);
            this.root.map.placeStaticEntity(entity);
            this.root.entityMgr.registerEntity(entity);
            return entity;
        }
        return null;
    }

    /**
     * Removes all entities with a RemovableMapEntityComponent which need to get
     * removed before placing this entity
     * @param {Entity} entity
     */
    freeEntityAreaBeforeBuild(entity) {
        const staticComp = entity.components.StaticMapEntity;
        const rect = staticComp.getTileSpaceBounds();
        // Remove any removeable colliding entities on the same layer
        for (let x = rect.x; x < rect.x + rect.w; ++x) {
            for (let y = rect.y; y < rect.y + rect.h; ++y) {
                const contents = this.root.map.getLayerContentXY(x, y, entity.layer);
                if (contents) {
                    assertAlways(
                        contents.components.StaticMapEntity.getMetaBuilding().getIsReplaceable(),
                        "Tried to replace non-repleaceable entity"
                    );
                    if (!this.tryDeleteBuilding(contents)) {
                        assertAlways(false, "Tried to replace non-repleaceable entity #2");
                    }
                }
            }
        }

        // Perform other callbacks
        this.root.signals.freeEntityAreaBeforeBuild.dispatch(entity);
    }

    /**
     * Performs a bulk operation, not updating caches in the meantime
     * @param {function} operation
     */
    performBulkOperation(operation) {
        logger.warn("Running bulk operation ...");
        assert(!this.root.bulkOperationRunning, "Can not run two bulk operations twice");
        this.root.bulkOperationRunning = true;
        const now = performance.now();
        const returnValue = operation();
        const duration = performance.now() - now;
        logger.log("Done in", round2Digits(duration), "ms");
        assert(this.root.bulkOperationRunning, "Bulk operation = false while bulk operation was running");
        this.root.bulkOperationRunning = false;
        this.root.signals.bulkOperationFinished.dispatch();
        return returnValue;
    }

    /**
     * Returns whether the given building can get removed
     * @param {Entity} building
     */
    canDeleteBuilding(building) {
        const staticComp = building.components.StaticMapEntity;
        return staticComp.getMetaBuilding().getIsRemovable();
    }

    /**
     * Tries to delete the given building
     * @param {Entity} building
     */
    tryDeleteBuilding(building) {
        if (!this.canDeleteBuilding(building)) {
            return false;
        }
        this.root.map.removeStaticEntity(building);
        this.root.entityMgr.destroyEntity(building);
        this.root.entityMgr.processDestroyList();
        return true;
    }

    /**
     *
     * Computes the flag for a given tile
     * @param {object} param0
     * @param {Vector} param0.tile The tile to check at
     * @param {enumDirection} param0.edge The edge to check for
     * @param {number} param0.rotation The local tiles base rotation
     */
    computeWireEdgeStatus({ tile, edge, rotation }) {
        const offset = enumDirectionToVector[edge];
        const refTile = tile.add(offset);
        // const angle = enumDirectionToAngle[edge];

        // // First, check if this edge can be connected from locally
        // const canConnectLocally = rotation === angle || (rotation + 180) % 360 === angle;

        const neighbourStatus = this.getWireEdgeFlag(refTile, edge);

        if (neighbourStatus === enumWireEdgeFlag.empty) {
            // It's empty, no point in connecting
            return false;
        }

        if (neighbourStatus === enumWireEdgeFlag.filled) {
            return true;
        }

        if (neighbourStatus === enumWireEdgeFlag.connected) {
            return true;
        }
    }

    /**
     * Gets the flag at the given tile
     * @param {Vector} tile
     * @param {enumDirection} edge
     * @returns {enumWireEdgeFlag}
     */
    getWireEdgeFlag(tile, edge) {
        // Search for relevant pins
        const pinEntities = this.root.map.getLayersContentsMultipleXY(tile.x, tile.y);

        // Go over all entities which could have a pin
        for (let i = 0; i < pinEntities.length; ++i) {
            const pinEntity = pinEntities[i];
            const pinComp = pinEntity.components.WiredPins;
            const staticComp = pinEntity.components.StaticMapEntity;

            // Skip those who don't have pins
            if (!pinComp) {
                continue;
            }

            // Go over all pins
            const pins = pinComp.slots;
            for (let k = 0; k < pinComp.slots.length; ++k) {
                const pinSlot = pins[k];
                const pinLocation = staticComp.localTileToWorld(pinSlot.pos);
                const pinDirection = staticComp.localDirectionToWorld(pinSlot.direction);

                // Check if the pin has the right location
                if (!pinLocation.equals(tile)) {
                    continue;
                }

                // Check if the pin has the right direction
                if (pinDirection !== enumInvertedDirections[edge]) {
                    continue;
                }

                // Found a pin!
                return enumWireEdgeFlag.connected;
            }
        }

        // Now check if there's a connectable wire
        const targetEntity = this.root.map.getTileContent(tile, enumLayer.wires);
        if (!targetEntity) {
            return enumWireEdgeFlag.empty;
        }

        // Check if its a crossing
        const wireTunnelComp = targetEntity.components.WireTunnel;
        if (wireTunnelComp) {
            return enumWireEdgeFlag.filled;
        }

        // Check if its a wire
        const wiresComp = targetEntity.components.Wire;
        if (!wiresComp) {
            return enumWireEdgeFlag.empty;
        }

        const refAngle = enumDirectionToAngle[edge];
        const refRotation = targetEntity.components.StaticMapEntity.originalRotation;
        const canConnectRemotely = refRotation === refAngle || (refRotation + 180) % 360 === refAngle;

        // Check if the wire points towards the right direction
        if (!canConnectRemotely) {
            // Seems its not the right direction - well, still its filled
            return enumWireEdgeFlag.filled;
        }

        // Actually connected
        return enumWireEdgeFlag.connected;
    }

    /**
     * Returns the acceptors and ejectors which affect the current tile
     * @param {Vector} tile
     * @returns {AcceptorsAndEjectorsAffectingTile}
     */
    getEjectorsAndAcceptorsAtTile(tile) {
        /** @type {EjectorsAffectingTile} */
        let ejectors = [];
        /** @type {AcceptorsAffectingTile} */
        let acceptors = [];

        // Well .. please ignore this code! :D
        for (let dx = -1; dx <= 1; ++dx) {
            for (let dy = -1; dy <= 1; ++dy) {
                if (Math.abs(dx) + Math.abs(dy) !== 1) {
                    continue;
                }

                const entity = this.root.map.getLayerContentXY(tile.x + dx, tile.y + dy, enumLayer.regular);
                if (entity) {
                    let ejectorSlots = [];
                    let acceptorSlots = [];

                    const staticComp = entity.components.StaticMapEntity;
                    const itemEjector = entity.components.ItemEjector;
                    const itemAcceptor = entity.components.ItemAcceptor;
                    const beltComp = entity.components.Belt;

                    if (itemEjector) {
                        ejectorSlots = itemEjector.slots.slice();
                    }

                    if (itemAcceptor) {
                        acceptorSlots = itemAcceptor.slots.slice();
                    }

                    if (beltComp) {
                        const fakeEjectorSlot = beltComp.getFakeEjectorSlot();
                        const fakeAcceptorSlot = beltComp.getFakeAcceptorSlot();
                        ejectorSlots.push(fakeEjectorSlot);
                        acceptorSlots.push(fakeAcceptorSlot);
                    }

                    for (let ejectorSlot = 0; ejectorSlot < ejectorSlots.length; ++ejectorSlot) {
                        const slot = ejectorSlots[ejectorSlot];
                        const wsTile = staticComp.localTileToWorld(slot.pos);
                        const wsDirection = staticComp.localDirectionToWorld(slot.direction);
                        const targetTile = wsTile.add(enumDirectionToVector[wsDirection]);
                        if (targetTile.equals(tile)) {
                            ejectors.push({
                                entity,
                                slot,
                                fromTile: wsTile,
                                toDirection: wsDirection,
                            });
                        }
                    }

                    for (let acceptorSlot = 0; acceptorSlot < acceptorSlots.length; ++acceptorSlot) {
                        const slot = acceptorSlots[acceptorSlot];
                        const wsTile = staticComp.localTileToWorld(slot.pos);
                        for (let k = 0; k < slot.directions.length; ++k) {
                            const direction = slot.directions[k];
                            const wsDirection = staticComp.localDirectionToWorld(direction);

                            const sourceTile = wsTile.add(enumDirectionToVector[wsDirection]);
                            if (sourceTile.equals(tile)) {
                                acceptors.push({
                                    entity,
                                    slot,
                                    toTile: wsTile,
                                    fromDirection: wsDirection,
                                });
                            }
                        }
                    }
                }
            }
        }
        return { ejectors, acceptors };
    }
}
