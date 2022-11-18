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
const logger: any = createLogger("ingame/logic");
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
        const rect: any = entity.components.StaticMapEntity.getTileSpaceBounds();
        if (offset) {
            rect.x += offset.x;
            rect.y += offset.y;
        }
        // Check the whole area of the building
        for (let x: any = rect.x; x < rect.x + rect.w; ++x) {
            for (let y: any = rect.y; y < rect.y + rect.h; ++y) {
                // Check if there is any direct collision
                const otherEntity: any = this.root.map.getLayerContentXY(x, y, entity.layer);
                if (otherEntity) {
                    const staticComp: any = otherEntity.components.StaticMapEntity;
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
            const toolbar: any = this.root.hud.parts.buildingsToolbar;
            const id: any = entity.components.StaticMapEntity.getMetaBuilding().getId();
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
        const entity: any = building.createEntity({
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
    freeEntityAreaBeforeBuild(entity: Entity): any {
        const staticComp: any = entity.components.StaticMapEntity;
        const rect: any = staticComp.getTileSpaceBounds();
        // Remove any removeable colliding entities on the same layer
        for (let x: any = rect.x; x < rect.x + rect.w; ++x) {
            for (let y: any = rect.y; y < rect.y + rect.h; ++y) {
                const contents: any = this.root.map.getLayerContentXY(x, y, entity.layer);
                if (contents) {
                    const staticComp: any = contents.components.StaticMapEntity;
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
    performBulkOperation(operation: function): any {
        logger.warn("Running bulk operation ...");
        assert(!this.root.bulkOperationRunning, "Can not run two bulk operations twice");
        this.root.bulkOperationRunning = true;
        const now: any = performance.now();
        const returnValue: any = operation();
        const duration: any = performance.now() - now;
        logger.log("Done in", round2Digits(duration), "ms");
        assert(this.root.bulkOperationRunning, "Bulk operation = false while bulk operation was running");
        this.root.bulkOperationRunning = false;
        this.root.signals.bulkOperationFinished.dispatch();
        return returnValue;
    }
    /**
     * Performs a immutable operation, causing no recalculations
     */
    performImmutableOperation(operation: function): any {
        logger.warn("Running immutable operation ...");
        assert(!this.root.immutableOperationRunning, "Can not run two immutalbe operations twice");
        this.root.immutableOperationRunning = true;
        const now: any = performance.now();
        const returnValue: any = operation();
        const duration: any = performance.now() - now;
        logger.log("Done in", round2Digits(duration), "ms");
        assert(this.root.immutableOperationRunning, "Immutable operation = false while immutable operation was running");
        this.root.immutableOperationRunning = false;
        this.root.signals.immutableOperationFinished.dispatch();
        return returnValue;
    }
    /**
     * Returns whether the given building can get removed
     */
    canDeleteBuilding(building: Entity): any {
        const staticComp: any = building.components.StaticMapEntity;
        return staticComp.getMetaBuilding().getIsRemovable(this.root);
    }
    /**
     * Tries to delete the given building
     */
    tryDeleteBuilding(building: Entity): any {
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
    }): any {
        const offset: any = enumDirectionToVector[edge];
        const targetTile: any = tile.add(offset);
        // Search for relevant pins
        const pinEntities: any = this.root.map.getLayersContentsMultipleXY(targetTile.x, targetTile.y);
        // Go over all entities which could have a pin
        for (let i: any = 0; i < pinEntities.length; ++i) {
            const pinEntity: any = pinEntities[i];
            const pinComp: any = pinEntity.components.WiredPins;
            const staticComp: any = pinEntity.components.StaticMapEntity;
            // Skip those who don't have pins
            if (!pinComp) {
                continue;
            }
            // Go over all pins
            const pins: any = pinComp.slots;
            for (let k: any = 0; k < pinComp.slots.length; ++k) {
                const pinSlot: any = pins[k];
                const pinLocation: any = staticComp.localTileToWorld(pinSlot.pos);
                const pinDirection: any = staticComp.localDirectionToWorld(pinSlot.direction);
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
        const targetEntity: any = this.root.map.getTileContent(targetTile, "wires");
        if (!targetEntity) {
            return false;
        }
        const targetStaticComp: any = targetEntity.components.StaticMapEntity;
        // Check if its a crossing
        const wireTunnelComp: any = targetEntity.components.WireTunnel;
        if (wireTunnelComp) {
            return true;
        }
        // Check if its a wire
        const wiresComp: any = targetEntity.components.Wire;
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
        let canConnectAtAll: any = false;
                const networks: Set<WireNetwork> = new Set();
        const staticComp: any = entity.components.StaticMapEntity;
        const wireComp: any = entity.components.Wire;
        if (wireComp) {
            canConnectAtAll = true;
            if (wireComp.linkedNetwork) {
                networks.add(wireComp.linkedNetwork);
            }
        }
        const tunnelComp: any = entity.components.WireTunnel;
        if (tunnelComp) {
            canConnectAtAll = true;
            for (let i: any = 0; i < tunnelComp.linkedNetworks.length; ++i) {
                networks.add(tunnelComp.linkedNetworks[i]);
            }
        }
        const pinsComp: any = entity.components.WiredPins;
        if (pinsComp) {
            const slots: any = pinsComp.slots;
            for (let i: any = 0; i < slots.length; ++i) {
                const slot: any = slots[i];
                const slotLocalPos: any = staticComp.localTileToWorld(slot.pos);
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
    getIsEntityIntersectedWithMatrix(entity: Entity, worldPos: Vector): any {
        const staticComp: any = entity.components.StaticMapEntity;
        const tile: any = worldPos.toTileSpace();
        if (!staticComp.getTileSpaceBounds().containsPoint(tile.x, tile.y)) {
            // No intersection at all
            return;
        }
        const data: any = getBuildingDataFromCode(staticComp.code);
        const overlayMatrix: any = data.metaInstance.getSpecialOverlayRenderMatrix(staticComp.rotation, data.rotationVariant, data.variant, entity);
        // Always the same
        if (!overlayMatrix) {
            return true;
        }
        const localPosition: any = worldPos
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
        for (let dx: any = -1; dx <= 1; ++dx) {
            for (let dy: any = -1; dy <= 1; ++dy) {
                if (Math.abs(dx) + Math.abs(dy) !== 1) {
                    continue;
                }
                const entity: any = this.root.map.getLayerContentXY(tile.x + dx, tile.y + dy, "regular");
                if (entity) {
                                        let ejectorSlots: Array<import("./components/item_ejector").ItemEjectorSlot> = [];
                                        let acceptorSlots: Array<import("./components/item_acceptor").ItemAcceptorSlot> = [];
                    const staticComp: any = entity.components.StaticMapEntity;
                    const itemEjector: any = entity.components.ItemEjector;
                    const itemAcceptor: any = entity.components.ItemAcceptor;
                    const beltComp: any = entity.components.Belt;
                    if (itemEjector) {
                        ejectorSlots = itemEjector.slots.slice();
                    }
                    if (itemAcceptor) {
                        acceptorSlots = itemAcceptor.slots.slice();
                    }
                    if (beltComp) {
                        const fakeEjectorSlot: any = beltComp.getFakeEjectorSlot();
                        const fakeAcceptorSlot: any = beltComp.getFakeAcceptorSlot();
                        ejectorSlots.push(fakeEjectorSlot);
                        acceptorSlots.push(fakeAcceptorSlot);
                    }
                    for (let ejectorSlot: any = 0; ejectorSlot < ejectorSlots.length; ++ejectorSlot) {
                        const slot: any = ejectorSlots[ejectorSlot];
                        const wsTile: any = staticComp.localTileToWorld(slot.pos);
                        const wsDirection: any = staticComp.localDirectionToWorld(slot.direction);
                        const targetTile: any = wsTile.add(enumDirectionToVector[wsDirection]);
                        if (targetTile.equals(tile)) {
                            ejectors.push({
                                entity,
                                slot,
                                fromTile: wsTile,
                                toDirection: wsDirection,
                            });
                        }
                    }
                    for (let acceptorSlot: any = 0; acceptorSlot < acceptorSlots.length; ++acceptorSlot) {
                        const slot: any = acceptorSlots[acceptorSlot];
                        const wsTile: any = staticComp.localTileToWorld(slot.pos);
                        const direction: any = slot.direction;
                        const wsDirection: any = staticComp.localDirectionToWorld(direction);
                        const sourceTile: any = wsTile.add(enumDirectionToVector[wsDirection]);
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
    clearAllBeltsAndItems(): any {
        for (const entity: any of this.root.entityMgr.entities) {
            for (const component: any of Object.values(entity.components)) {
                component as Component).clear();
            }
        }
    }
}
