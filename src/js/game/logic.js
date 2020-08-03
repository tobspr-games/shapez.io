import { createLogger } from "../core/logging";
import { round2Digits } from "../core/utils";
import { enumDirection, enumDirectionToVector, Vector } from "../core/vector";
import { Entity } from "./entity";
import { MetaBuilding } from "./meta_building";
import { STOP_PROPAGATION } from "../core/signal";

const logger = createLogger("ingame/logic");

/**
 * @typedef {import("./root").GameRoot} GameRoot
 * @typedef {import("./root").Layer} Layer
 *
 * @typedef {Array<{
 *  entity: Entity,
 *  slot: import("./components/item_ejector").ItemEjectorSlot,
 *  fromTile: Vector,
 *  toDirection: enumDirection
 * }>} EjectorsAffectingTile
 *
 * @typedef {Array<{
 *  entity: Entity,
 *  slot: import("./components/item_acceptor").ItemAcceptorSlot,
 *  toTile: Vector,
 *  fromDirection: enumDirection
 * }>} AcceptorsAffectingTile
 *
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
                if (otherEntity && !otherEntity.components.ReplaceableMapEntity) {
                    // This one is a direct blocker
                    return false;
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
                        contents.components.ReplaceableMapEntity,
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
        return building.components.StaticMapEntity && !building.components.Unremovable;
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
     * Returns the acceptors and ejectors which affect the current tile
     * @param {Vector} tile
     * @param {Layer} layer
     * @returns {AcceptorsAndEjectorsAffectingTile}
     */
    getEjectorsAndAcceptorsAtTile(tile, layer) {
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

                const entities = this.root.map.getLayersContentsMultipleXY(tile.x + dx, tile.y + dy);
                for (let i = 0; i < entities.length; ++i) {
                    const entity = entities[i];

                    const staticComp = entity.components.StaticMapEntity;
                    const itemEjector = entity.components.ItemEjector;
                    if (itemEjector) {
                        for (let ejectorSlot = 0; ejectorSlot < itemEjector.slots.length; ++ejectorSlot) {
                            const slot = itemEjector.slots[ejectorSlot];
                            if (slot.layer !== layer) {
                                continue;
                            }
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
                    }

                    const itemAcceptor = entity.components.ItemAcceptor;
                    if (itemAcceptor) {
                        for (let acceptorSlot = 0; acceptorSlot < itemAcceptor.slots.length; ++acceptorSlot) {
                            const slot = itemAcceptor.slots[acceptorSlot];
                            if (slot.layer !== layer) {
                                continue;
                            }

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
        }
        return { ejectors, acceptors };
    }
}
