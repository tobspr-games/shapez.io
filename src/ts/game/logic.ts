import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { STOP_PROPAGATION } from "../core/signal";
import { round2Digits } from "../core/utils";
import { enumDirection, enumDirectionToVector, enumInvertedDirections, Vector } from "../core/vector";
import { getBuildingDataFromCode } from "./building_codes";
import { Component } from "./component";
import { enumWireVariant } from "./components/wire";
import { Entity } from "./entity";
import { CHUNK_OVERLAY_RES } from "./map_chunk_view";
import { MetaBuilding } from "./meta_building";
import { GameRoot } from "./root";
import { WireNetwork } from "./systems/wire";
const logger = createLogger("ingame/logic");
export type EjectorsAffectingTile = Array<{
    entity: Entity;
    slot: import("./components/item_ejector").ItemEjectorSlot;
    fromTile: Vector;
    toDirection: enumDirection;
}>;
export type AcceptorsAffectingTile = Array<{
    entity: Entity;
    slot: import("./components/item_acceptor").ItemAcceptorSlot;
    toTile: Vector;
    fromDirection: enumDirection;
}>;
export type AcceptorsAndEjectorsAffectingTile = {
    acceptors: AcceptorsAffectingTile;
    ejectors: EjectorsAffectingTile;
};



export class GameLogic {
    public root = root;

        constructor(root) {
    }
    /**
     * Checks if the given entity can be placed
     * {} true if the entity could be placed there
     */
    checkCanPlaceEntity(entity: Entity, { allowReplaceBuildings = true, offset = null }: {
        allowReplaceBuildings: boolean=;
        offset: Vector=;
    }): boolean {
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
                    const staticComp = otherEntity.components.StaticMapEntity;
                    if (!allowReplaceBuildings ||
                        !staticComp
                            .getMetaBuilding()
                            .getIsReplaceable(staticComp.getVariant(), staticComp.getRotationVariant())) {
                        // This one is a direct blocker
                        return false;
                    }
                }
            }
        }
        // Perform additional placement checks
        if (this.root.gameMode.getIsEditor()) {
            const toolbar = this.root.hud.parts.buildingsToolbar;
            const id = entity.components.StaticMapEntity.getMetaBuilding().getId();
            if (toolbar.buildingHandles[id].puzzleLocked) {
                return false;
            }
        }
        if (this.root.signals.prePlacementCheck.dispatch(entity, offset) === STOP_PROPAGATION) {
            return false;
        }
        return true;
    }
    /**
     * Attempts to place the given building
     * {}
     */
    tryPlaceBuilding({ origin, rotation, rotationVariant, originalRotation, variant, building }: {
        origin: Vector;
        rotation: number;
        originalRotation: number;
        rotationVariant: number;
        variant: string;
        building: MetaBuilding;
    }): Entity {
        const entity = building.createEntity({
            root: this.root,
            origin,
            rotation,
            originalRotation,
            rotationVariant,
            variant,
        });
        if (this.checkCanPlaceEntity(entity, {})) {
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
     */
    freeEntityAreaBeforeBuild(entity: Entity) {
        const staticComp = entity.components.StaticMapEntity;
        const rect = staticComp.getTileSpaceBounds();
        // Remove any removeable colliding entities on the same layer
        for (let x = rect.x; x < rect.x + rect.w; ++x) {
            for (let y = rect.y; y < rect.y + rect.h; ++y) {
                const contents = this.root.map.getLayerContentXY(x, y, entity.layer);
                if (contents) {
                    const staticComp = contents.components.StaticMapEntity;
                    assertAlways(staticComp
                        .getMetaBuilding()
                        .getIsReplaceable(staticComp.getVariant(), staticComp.getRotationVariant()), "Tried to replace non-repleaceable entity");
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
     */
    performBulkOperation(operation: function) {
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
     * Performs a immutable operation, causing no recalculations
     */
    performImmutableOperation(operation: function) {
        logger.warn("Running immutable operation ...");
        assert(!this.root.immutableOperationRunning, "Can not run two immutalbe operations twice");
        this.root.immutableOperationRunning = true;
        const now = performance.now();
        const returnValue = operation();
        const duration = performance.now() - now;
        logger.log("Done in", round2Digits(duration), "ms");
        assert(this.root.immutableOperationRunning, "Immutable operation = false while immutable operation was running");
        this.root.immutableOperationRunning = false;
        this.root.signals.immutableOperationFinished.dispatch();
        return returnValue;
    }
    /**
     * Returns whether the given building can get removed
     */
    canDeleteBuilding(building: Entity) {
        const staticComp = building.components.StaticMapEntity;
        return staticComp.getMetaBuilding().getIsRemovable(this.root);
    }
    /**
     * Tries to delete the given building
     */
    tryDeleteBuilding(building: Entity) {
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
     */
    computeWireEdgeStatus({ wireVariant, tile, edge }: {
        wireVariant: enumWireVariant;
        tile: Vector;
        edge: enumDirection;
    }) {
        const offset = enumDirectionToVector[edge];
        const targetTile = tile.add(offset);
        // Search for relevant pins
        const pinEntities = this.root.map.getLayersContentsMultipleXY(targetTile.x, targetTile.y);
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
                if (!pinLocation.equals(targetTile)) {
                    continue;
                }
                // Check if the pin has the right direction
                if (pinDirection !== enumInvertedDirections[edge]) {
                    continue;
                }
                // Found a pin!
                return true;
            }
        }
        // Now check if there's a connectable entity on the wires layer
        const targetEntity = this.root.map.getTileContent(targetTile, "wires");
        if (!targetEntity) {
            return false;
        }
        const targetStaticComp = targetEntity.components.StaticMapEntity;
        // Check if its a crossing
        const wireTunnelComp = targetEntity.components.WireTunnel;
        if (wireTunnelComp) {
            return true;
        }
        // Check if its a wire
        const wiresComp = targetEntity.components.Wire;
        if (!wiresComp) {
            return false;
        }
        // It's connected if its the same variant
        return wiresComp.variant === wireVariant;
    }
    /**
     * Returns all wire networks this entity participates in on the given tile
     * {} Null if the entity is never able to be connected at the given tile
     */
    getEntityWireNetworks(entity: Entity, tile: Vector): Array<WireNetwork> | null {
        let canConnectAtAll = false;
                const networks: Set<WireNetwork> = new Set();
        const staticComp = entity.components.StaticMapEntity;
        const wireComp = entity.components.Wire;
        if (wireComp) {
            canConnectAtAll = true;
            if (wireComp.linkedNetwork) {
                networks.add(wireComp.linkedNetwork);
            }
        }
        const tunnelComp = entity.components.WireTunnel;
        if (tunnelComp) {
            canConnectAtAll = true;
            for (let i = 0; i < tunnelComp.linkedNetworks.length; ++i) {
                networks.add(tunnelComp.linkedNetworks[i]);
            }
        }
        const pinsComp = entity.components.WiredPins;
        if (pinsComp) {
            const slots = pinsComp.slots;
            for (let i = 0; i < slots.length; ++i) {
                const slot = slots[i];
                const slotLocalPos = staticComp.localTileToWorld(slot.pos);
                if (slotLocalPos.equals(tile)) {
                    canConnectAtAll = true;
                    if (slot.linkedNetwork) {
                        networks.add(slot.linkedNetwork);
                    }
                }
            }
        }
        if (!canConnectAtAll) {
            return null;
        }
        return Array.from(networks);
    }
    /**
     * Returns if the entities tile *and* his overlay matrix is intersected
     */
    getIsEntityIntersectedWithMatrix(entity: Entity, worldPos: Vector) {
        const staticComp = entity.components.StaticMapEntity;
        const tile = worldPos.toTileSpace();
        if (!staticComp.getTileSpaceBounds().containsPoint(tile.x, tile.y)) {
            // No intersection at all
            return;
        }
        const data = getBuildingDataFromCode(staticComp.code);
        const overlayMatrix = data.metaInstance.getSpecialOverlayRenderMatrix(staticComp.rotation, data.rotationVariant, data.variant, entity);
        // Always the same
        if (!overlayMatrix) {
            return true;
        }
        const localPosition = worldPos
            .divideScalar(globalConfig.tileSize)
            .modScalar(1)
            .multiplyScalar(CHUNK_OVERLAY_RES)
            .floor();
        return !!overlayMatrix[localPosition.x + localPosition.y * 3];
    }
    /**
     * Returns the acceptors and ejectors which affect the current tile
     * {}
     */
    getEjectorsAndAcceptorsAtTile(tile: Vector): AcceptorsAndEjectorsAffectingTile {
                let ejectors: EjectorsAffectingTile = [];
                let acceptors: AcceptorsAffectingTile = [];
        // Well .. please ignore this code! :D
        for (let dx = -1; dx <= 1; ++dx) {
            for (let dy = -1; dy <= 1; ++dy) {
                if (Math.abs(dx) + Math.abs(dy) !== 1) {
                    continue;
                }
                const entity = this.root.map.getLayerContentXY(tile.x + dx, tile.y + dy, "regular");
                if (entity) {
                                        let ejectorSlots: Array<import("./components/item_ejector").ItemEjectorSlot> = [];
                                        let acceptorSlots: Array<import("./components/item_acceptor").ItemAcceptorSlot> = [];
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
                        const direction = slot.direction;
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
        return { ejectors, acceptors };
    }
    /**
     * Clears all belts and items
     */
    clearAllBeltsAndItems() {
        for (const entity of this.root.entityMgr.entities) {
            for (const component of Object.values(entity.components)) {
                component as Component).clear();
            }
        }
    }
}
