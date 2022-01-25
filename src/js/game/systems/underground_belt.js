import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import { createLogger } from "../../core/logging";
import { Rectangle } from "../../core/rectangle";
import { StaleAreaDetector } from "../../core/stale_area_detector";
import {
    enumAngleToDirection,
    enumDirection,
    enumDirectionToAngle,
    enumDirectionToVector,
    enumInvertedDirections,
} from "../../core/vector";
import { enumUndergroundBeltMode, UndergroundBeltComponent } from "../components/underground_belt";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";

const logger = createLogger("tunnels");

export class UndergroundBeltSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [UndergroundBeltComponent]);

        this.beltSprites = {
            [enumUndergroundBeltMode.sender]: Loader.getSprite(
                "sprites/buildings/underground_belt_entry.png"
            ),
            [enumUndergroundBeltMode.receiver]: Loader.getSprite(
                "sprites/buildings/underground_belt_exit.png"
            ),
        };

        this.staleAreaWatcher = new StaleAreaDetector({
            root: this.root,
            name: "underground-belt",
            recomputeMethod: this.recomputeArea.bind(this),
        });

        this.root.signals.entityManuallyPlaced.add(this.onEntityManuallyPlaced, this);

        // NOTICE: Once we remove a tunnel, we need to update the whole area to
        // clear outdated handles
        this.staleAreaWatcher.recomputeOnComponentsChanged(
            [UndergroundBeltComponent],
            globalConfig.undergroundBeltMaxTilesByTier[globalConfig.undergroundBeltMaxTilesByTier.length - 1]
        );
    }

    /**
     * Callback when an entity got placed, used to remove belts between underground belts
     * @param {Entity} entity
     */
    onEntityManuallyPlaced(entity) {
        if (!this.root.app.settings.getAllSettings().enableTunnelSmartplace) {
            // Smart-place disabled
            return;
        }

        const undergroundComp = entity.components.UndergroundBelt;
        if (undergroundComp && undergroundComp.mode === enumUndergroundBeltMode.receiver) {
            const staticComp = entity.components.StaticMapEntity;
            const tile = staticComp.origin;

            const direction = enumAngleToDirection[staticComp.rotation];
            const inverseDirection = enumInvertedDirections[direction];
            const offset = enumDirectionToVector[inverseDirection];

            let currentPos = tile.copy();

            const tier = undergroundComp.tier;
            const range = globalConfig.undergroundBeltMaxTilesByTier[tier];

            // FIND ENTRANCE
            // Search for the entrance which is farthest apart (this is why we can't reuse logic here)
            let matchingEntrance = null;
            for (let i = 0; i < range; ++i) {
                currentPos.addInplace(offset);
                const contents = this.root.map.getTileContent(currentPos, entity.layer);
                if (!contents) {
                    continue;
                }

                const contentsUndergroundComp = contents.components.UndergroundBelt;
                const contentsStaticComp = contents.components.StaticMapEntity;
                if (
                    contentsUndergroundComp &&
                    contentsUndergroundComp.tier === undergroundComp.tier &&
                    contentsUndergroundComp.mode === enumUndergroundBeltMode.sender &&
                    enumAngleToDirection[contentsStaticComp.rotation] === direction
                ) {
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
            let allBeltsMatch = true;
            for (let i = 0; i < matchingEntrance.range; ++i) {
                currentPos.addInplace(offset);

                const contents = this.root.map.getTileContent(currentPos, entity.layer);
                if (!contents) {
                    allBeltsMatch = false;
                    break;
                }

                const contentsStaticComp = contents.components.StaticMapEntity;
                const contentsBeltComp = contents.components.Belt;
                if (!contentsBeltComp) {
                    allBeltsMatch = false;
                    break;
                }

                // It's a belt
                if (
                    contentsBeltComp.direction !== enumDirection.top ||
                    enumAngleToDirection[contentsStaticComp.rotation] !== direction
                ) {
                    allBeltsMatch = false;
                    break;
                }
            }

            currentPos = tile.copy();
            if (allBeltsMatch) {
                // All belts between this are obsolete, so drop them
                for (let i = 0; i < matchingEntrance.range; ++i) {
                    currentPos.addInplace(offset);
                    const contents = this.root.map.getTileContent(currentPos, entity.layer);
                    assert(contents, "Invalid smart underground belt logic");
                    this.root.logic.tryDeleteBuilding(contents);
                }
            }

            // REMOVE OBSOLETE TUNNELS
            // Remove any double tunnels, by checking the tile plus the tile above
            currentPos = tile.copy().add(offset);
            for (let i = 0; i < matchingEntrance.range - 1; ++i) {
                const posBefore = currentPos.copy();
                currentPos.addInplace(offset);

                const entityBefore = this.root.map.getTileContent(posBefore, entity.layer);
                const entityAfter = this.root.map.getTileContent(currentPos, entity.layer);

                if (!entityBefore || !entityAfter) {
                    continue;
                }

                const undergroundBefore = entityBefore.components.UndergroundBelt;
                const undergroundAfter = entityAfter.components.UndergroundBelt;

                if (!undergroundBefore || !undergroundAfter) {
                    // Not an underground belt
                    continue;
                }

                if (
                    // Both same tier
                    undergroundBefore.tier !== undergroundAfter.tier ||
                    // And same tier as our original entity
                    undergroundBefore.tier !== undergroundComp.tier
                ) {
                    // Mismatching tier
                    continue;
                }

                if (
                    undergroundBefore.mode !== enumUndergroundBeltMode.sender ||
                    undergroundAfter.mode !== enumUndergroundBeltMode.receiver
                ) {
                    // Not the right mode
                    continue;
                }

                // Check rotations
                const staticBefore = entityBefore.components.StaticMapEntity;
                const staticAfter = entityAfter.components.StaticMapEntity;

                if (
                    enumAngleToDirection[staticBefore.rotation] !== direction ||
                    enumAngleToDirection[staticAfter.rotation] !== direction
                ) {
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
     * @param {Rectangle} area
     */
    recomputeArea(area) {
        for (let x = area.x; x < area.right(); ++x) {
            for (let y = area.y; y < area.bottom(); ++y) {
                const entities = this.root.map.getLayersContentsMultipleXY(x, y);
                for (let i = 0; i < entities.length; ++i) {
                    const entity = entities[i];
                    const undergroundComp = entity.components.UndergroundBelt;
                    if (!undergroundComp) {
                        continue;
                    }
                    undergroundComp.cachedLinkedEntity = null;
                }
            }
        }
    }

    update() {
        this.staleAreaWatcher.update();

        const sender = enumUndergroundBeltMode.sender;

        const progressGrowth =
            this.root.dynamicTickrate.deltaSeconds *
            this.root.hubGoals.getBeltBaseSpeed() *
            globalConfig.itemSpacingOnBelts;

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const undergroundComp = entity.components.UndergroundBelt;
            if (undergroundComp.mode === sender) {
                this.handleSender(entity);
            } else {
                this.handleReceiver(entity, progressGrowth);
            }
        }
    }

    /**
     * Finds the receiver for a given sender
     * @param {Entity} entity
     * @returns {import("../components/underground_belt").LinkedUndergroundBelt}
     */
    findRecieverForSender(entity) {
        const staticComp = entity.components.StaticMapEntity;
        const undergroundComp = entity.components.UndergroundBelt;
        const searchDirection = staticComp.localDirectionToWorld(enumDirection.top);
        const searchVector = enumDirectionToVector[searchDirection];
        const targetRotation = enumDirectionToAngle[searchDirection];
        let currentTile = staticComp.origin;

        // Search in the direction of the tunnel
        for (
            let searchOffset = 1;
            searchOffset < globalConfig.undergroundBeltMaxTilesByTier[undergroundComp.tier] + 1;
            ++searchOffset
        ) {
            currentTile = currentTile.add(searchVector);

            const potentialReceiver = this.root.map.getTileContent(currentTile, "regular");
            if (!potentialReceiver) {
                // Empty tile
                continue;
            }
            const receiverUndergroundComp = potentialReceiver.components.UndergroundBelt;
            if (!receiverUndergroundComp || receiverUndergroundComp.tier !== undergroundComp.tier) {
                // Not a tunnel, or not on the same tier
                continue;
            }

            const receiverStaticComp = potentialReceiver.components.StaticMapEntity;
            if (receiverStaticComp.rotation !== targetRotation) {
                // Wrong rotation
                continue;
            }

            if (receiverUndergroundComp.mode !== enumUndergroundBeltMode.receiver) {
                // Not a receiver, but a sender -> Abort to make sure we don't deliver double
                break;
            }

            // make sure to link the other way as well
            receiverUndergroundComp.cachedLinkedEntity = { entity: null, distance: searchOffset };
            return { entity: potentialReceiver, distance: searchOffset };
        }

        // None found
        return { entity: null, distance: 0 };
    }

    /**
     *
     * @param {Entity} entity
     */
    handleSender(entity) {
        const undergroundComp = entity.components.UndergroundBelt;
        const acceptorComp = entity.components.ItemAcceptor;

        // Find the current receiver
        let cacheEntry = undergroundComp.cachedLinkedEntity;
        if (!cacheEntry) {
            // Need to recompute cache
            cacheEntry = undergroundComp.cachedLinkedEntity = this.findRecieverForSender(entity);
        }

        if (!cacheEntry.entity) {
            // If there is no connection to a receiver, ignore this one
            return;
        }

        const input = acceptorComp.completedInputs[0];
        if (input) {
            // Check if the receiver can accept it
            if (
                cacheEntry.entity.components.UndergroundBelt.tryAcceptTunneledItem(
                    input.item,
                    cacheEntry.distance,
                    input.extraProgress
                )
            ) {
                acceptorComp.completedInputs.splice(0);
            }
        }
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} progressGrowth
     */
    handleReceiver(entity, progressGrowth) {
        const undergroundComp = entity.components.UndergroundBelt;

        if (!undergroundComp.cachedLinkedEntity) return;
        const distance = undergroundComp.cachedLinkedEntity.distance;

        // Move items along
        for (let i = 0; i < undergroundComp.pendingItems.length; i++) {
            const itemAndProgress = undergroundComp.pendingItems[i];
            if (itemAndProgress[1] < distance) {
                itemAndProgress[1] += progressGrowth;
            }

            if (itemAndProgress[1] >= distance) {
                const ejectorComp = entity.components.ItemEjector;

                const nextSlotIndex = ejectorComp.getFirstFreeSlot();
                if (nextSlotIndex !== null) {
                    const extraProgress = itemAndProgress[1] - distance;
                    if (ejectorComp.tryEject(nextSlotIndex, itemAndProgress[0], extraProgress)) {
                        undergroundComp.pendingItems.shift();
                    }
                }
            }
        }
    }
}
