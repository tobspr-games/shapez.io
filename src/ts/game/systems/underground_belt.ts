import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import { createLogger } from "../../core/logging";
import { Rectangle } from "../../core/rectangle";
import { StaleAreaDetector } from "../../core/stale_area_detector";
import { fastArrayDelete } from "../../core/utils";
import { enumAngleToDirection, enumDirection, enumDirectionToAngle, enumDirectionToVector, enumInvertedDirections, } from "../../core/vector";
import { enumUndergroundBeltMode, UndergroundBeltComponent } from "../components/underground_belt";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
const logger: any = createLogger("tunnels");
export class UndergroundBeltSystem extends GameSystemWithFilter {
    public beltSprites = {
        [enumUndergroundBeltMode.sender]: Loader.getSprite("sprites/buildings/underground_belt_entry.png"),
        [enumUndergroundBeltMode.receiver]: Loader.getSprite("sprites/buildings/underground_belt_exit.png"),
    };
    public staleAreaWatcher = new StaleAreaDetector({
        root: this.root,
        name: "underground-belt",
        recomputeMethod: this.recomputeArea.bind(this),
    });

    constructor(root) {
        super(root, [UndergroundBeltComponent]);
        this.root.signals.entityManuallyPlaced.add(this.onEntityManuallyPlaced, this);
        // NOTICE: Once we remove a tunnel, we need to update the whole area to
        // clear outdated handles
        this.staleAreaWatcher.recomputeOnComponentsChanged([UndergroundBeltComponent], globalConfig.undergroundBeltMaxTilesByTier[globalConfig.undergroundBeltMaxTilesByTier.length - 1]);
    }
    /**
     * Callback when an entity got placed, used to remove belts between underground belts
     */
    onEntityManuallyPlaced(entity: Entity): any {
        if (!this.root.app.settings.getAllSettings().enableTunnelSmartplace) {
            // Smart-place disabled
            return;
        }
        const undergroundComp: any = entity.components.UndergroundBelt;
        if (undergroundComp && undergroundComp.mode === enumUndergroundBeltMode.receiver) {
            const staticComp: any = entity.components.StaticMapEntity;
            const tile: any = staticComp.origin;
            const direction: any = enumAngleToDirection[staticComp.rotation];
            const inverseDirection: any = enumInvertedDirections[direction];
            const offset: any = enumDirectionToVector[inverseDirection];
            let currentPos: any = tile.copy();
            const tier: any = undergroundComp.tier;
            const range: any = globalConfig.undergroundBeltMaxTilesByTier[tier];
            // FIND ENTRANCE
            // Search for the entrance which is farthest apart (this is why we can't reuse logic here)
            let matchingEntrance: any = null;
            for (let i: any = 0; i < range; ++i) {
                currentPos.addInplace(offset);
                const contents: any = this.root.map.getTileContent(currentPos, entity.layer);
                if (!contents) {
                    continue;
                }
                const contentsUndergroundComp: any = contents.components.UndergroundBelt;
                const contentsStaticComp: any = contents.components.StaticMapEntity;
                if (contentsUndergroundComp &&
                    contentsUndergroundComp.tier === undergroundComp.tier &&
                    contentsUndergroundComp.mode === enumUndergroundBeltMode.sender &&
                    enumAngleToDirection[contentsStaticComp.rotation] === direction) {
                    matchingEntrance = {
                        entity: contents,
                        range: i,
                    };
                }
            }
            if (!matchingEntrance) {
                // Nothing found
                return;
            }
            // DETECT OBSOLETE BELTS BETWEEN
            // Remove any belts between entrance and exit which have the same direction,
            // but only if they *all* have the right direction
            currentPos = tile.copy();
            let allBeltsMatch: any = true;
            for (let i: any = 0; i < matchingEntrance.range; ++i) {
                currentPos.addInplace(offset);
                const contents: any = this.root.map.getTileContent(currentPos, entity.layer);
                if (!contents) {
                    allBeltsMatch = false;
                    break;
                }
                const contentsStaticComp: any = contents.components.StaticMapEntity;
                const contentsBeltComp: any = contents.components.Belt;
                if (!contentsBeltComp) {
                    allBeltsMatch = false;
                    break;
                }
                // It's a belt
                if (contentsBeltComp.direction !== enumDirection.top ||
                    enumAngleToDirection[contentsStaticComp.rotation] !== direction) {
                    allBeltsMatch = false;
                    break;
                }
            }
            currentPos = tile.copy();
            if (allBeltsMatch) {
                // All belts between this are obsolete, so drop them
                for (let i: any = 0; i < matchingEntrance.range; ++i) {
                    currentPos.addInplace(offset);
                    const contents: any = this.root.map.getTileContent(currentPos, entity.layer);
                    assert(contents, "Invalid smart underground belt logic");
                    this.root.logic.tryDeleteBuilding(contents);
                }
            }
            // REMOVE OBSOLETE TUNNELS
            // Remove any double tunnels, by checking the tile plus the tile above
            currentPos = tile.copy().add(offset);
            for (let i: any = 0; i < matchingEntrance.range - 1; ++i) {
                const posBefore: any = currentPos.copy();
                currentPos.addInplace(offset);
                const entityBefore: any = this.root.map.getTileContent(posBefore, entity.layer);
                const entityAfter: any = this.root.map.getTileContent(currentPos, entity.layer);
                if (!entityBefore || !entityAfter) {
                    continue;
                }
                const undergroundBefore: any = entityBefore.components.UndergroundBelt;
                const undergroundAfter: any = entityAfter.components.UndergroundBelt;
                if (!undergroundBefore || !undergroundAfter) {
                    // Not an underground belt
                    continue;
                }
                if (
                // Both same tier
                undergroundBefore.tier !== undergroundAfter.tier ||
                    // And same tier as our original entity
                    undergroundBefore.tier !== undergroundComp.tier) {
                    // Mismatching tier
                    continue;
                }
                if (undergroundBefore.mode !== enumUndergroundBeltMode.sender ||
                    undergroundAfter.mode !== enumUndergroundBeltMode.receiver) {
                    // Not the right mode
                    continue;
                }
                // Check rotations
                const staticBefore: any = entityBefore.components.StaticMapEntity;
                const staticAfter: any = entityAfter.components.StaticMapEntity;
                if (enumAngleToDirection[staticBefore.rotation] !== direction ||
                    enumAngleToDirection[staticAfter.rotation] !== direction) {
                    // Wrong rotation
                    continue;
                }
                // All good, can remove
                this.root.logic.tryDeleteBuilding(entityBefore);
                this.root.logic.tryDeleteBuilding(entityAfter);
            }
        }
    }
    /**
     * Recomputes the cache in the given area, invalidating all entries there
     */
    recomputeArea(area: Rectangle): any {
        for (let x: any = area.x; x < area.right(); ++x) {
            for (let y: any = area.y; y < area.bottom(); ++y) {
                const entities: any = this.root.map.getLayersContentsMultipleXY(x, y);
                for (let i: any = 0; i < entities.length; ++i) {
                    const entity: any = entities[i];
                    const undergroundComp: any = entity.components.UndergroundBelt;
                    if (!undergroundComp) {
                        continue;
                    }
                    undergroundComp.cachedLinkedEntity = null;
                }
            }
        }
    }
    update(): any {
        this.staleAreaWatcher.update();
        const sender: any = enumUndergroundBeltMode.sender;
        const now: any = this.root.time.now();
        for (let i: any = 0; i < this.allEntities.length; ++i) {
            const entity: any = this.allEntities[i];
            const undergroundComp: any = entity.components.UndergroundBelt;
            if (undergroundComp.mode === sender) {
                this.handleSender(entity);
            }
            else {
                this.handleReceiver(entity, now);
            }
        }
    }
    /**
     * Finds the receiver for a given sender
     * {}
     */
    findRecieverForSender(entity: Entity): import("../components/underground_belt").LinkedUndergroundBelt {
        const staticComp: any = entity.components.StaticMapEntity;
        const undergroundComp: any = entity.components.UndergroundBelt;
        const searchDirection: any = staticComp.localDirectionToWorld(enumDirection.top);
        const searchVector: any = enumDirectionToVector[searchDirection];
        const targetRotation: any = enumDirectionToAngle[searchDirection];
        let currentTile: any = staticComp.origin;
        // Search in the direction of the tunnel
        for (let searchOffset: any = 0; searchOffset < globalConfig.undergroundBeltMaxTilesByTier[undergroundComp.tier]; ++searchOffset) {
            currentTile = currentTile.add(searchVector);
            const potentialReceiver: any = this.root.map.getTileContent(currentTile, "regular");
            if (!potentialReceiver) {
                // Empty tile
                continue;
            }
            const receiverUndergroundComp: any = potentialReceiver.components.UndergroundBelt;
            if (!receiverUndergroundComp || receiverUndergroundComp.tier !== undergroundComp.tier) {
                // Not a tunnel, or not on the same tier
                continue;
            }
            const receiverStaticComp: any = potentialReceiver.components.StaticMapEntity;
            if (receiverStaticComp.rotation !== targetRotation) {
                // Wrong rotation
                continue;
            }
            if (receiverUndergroundComp.mode !== enumUndergroundBeltMode.receiver) {
                // Not a receiver, but a sender -> Abort to make sure we don't deliver double
                break;
            }
            return { entity: potentialReceiver, distance: searchOffset };
        }
        // None found
        return { entity: null, distance: 0 };
    }
        handleSender(entity: Entity): any {
        const undergroundComp: any = entity.components.UndergroundBelt;
        // Find the current receiver
        let cacheEntry: any = undergroundComp.cachedLinkedEntity;
        if (!cacheEntry) {
            // Need to recompute cache
            cacheEntry = undergroundComp.cachedLinkedEntity = this.findRecieverForSender(entity);
        }
        if (!cacheEntry.entity) {
            // If there is no connection to a receiver, ignore this one
            return;
        }
        // Check if we have any items to eject
        const nextItemAndDuration: any = undergroundComp.pendingItems[0];
        if (nextItemAndDuration) {
            assert(undergroundComp.pendingItems.length === 1, "more than 1 pending");
            // Check if the receiver can accept it
            if (cacheEntry.entity.components.UndergroundBelt.tryAcceptTunneledItem(nextItemAndDuration[0], cacheEntry.distance, this.root.hubGoals.getUndergroundBeltBaseSpeed(), this.root.time.now())) {
                // Drop this item
                fastArrayDelete(undergroundComp.pendingItems, 0);
            }
        }
    }
        handleReceiver(entity: Entity, now: number): any {
        const undergroundComp: any = entity.components.UndergroundBelt;
        // Try to eject items, we only check the first one because it is sorted by remaining time
        const nextItemAndDuration: any = undergroundComp.pendingItems[0];
        if (nextItemAndDuration) {
            if (now > nextItemAndDuration[1]) {
                const ejectorComp: any = entity.components.ItemEjector;
                const nextSlotIndex: any = ejectorComp.getFirstFreeSlot();
                if (nextSlotIndex !== null) {
                    if (ejectorComp.tryEject(nextSlotIndex, nextItemAndDuration[0])) {
                        undergroundComp.pendingItems.shift();
                    }
                }
            }
        }
    }
}
