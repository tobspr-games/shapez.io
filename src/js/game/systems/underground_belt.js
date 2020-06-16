import { Math_max } from "../../core/builtins";
import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import {
    enumDirection,
    enumDirectionToAngle,
    enumDirectionToVector,
    Vector,
    enumAngleToDirection,
    enumInvertedDirections,
} from "../../core/vector";
import { enumUndergroundBeltMode, UndergroundBeltComponent } from "../components/underground_belt";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";

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

        this.root.signals.entityManuallyPlaced.add(this.onEntityPlaced, this);
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const undergroundComp = entity.components.UndergroundBelt;

            // Decrease remaining time of all items in belt
            for (let k = 0; k < undergroundComp.pendingItems.length; ++k) {
                const item = undergroundComp.pendingItems[k];
                item[1] = Math_max(0, item[1] - this.root.dynamicTickrate.deltaSeconds);

                if (G_IS_DEV && globalConfig.debug.instantBelts) {
                    item[1] = 0;
                }
            }

            if (undergroundComp.mode === enumUndergroundBeltMode.sender) {
                this.handleSender(entity);
            } else {
                this.handleReceiver(entity);
            }
        }
    }

    /**
     * Callback when an entity got placed, used to remove belts between underground belts
     * @param {Entity} entity
     */
    onEntityPlaced(entity) {
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

            // Search for the entrance which is furthes apart (this is why we can't reuse logic here)
            let matchingEntrance = null;
            for (let i = 0; i < range; ++i) {
                currentPos.addInplace(offset);
                const contents = this.root.map.getTileContent(currentPos);
                if (!contents) {
                    continue;
                }

                const contentsUndergroundComp = contents.components.UndergroundBelt;
                if (
                    contentsUndergroundComp &&
                    contentsUndergroundComp.tier === undergroundComp.tier &&
                    contentsUndergroundComp.mode === enumUndergroundBeltMode.sender
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

            // Remove any belts between entrance and exit which have the same direction
            currentPos = tile.copy();
            for (let i = 0; i < matchingEntrance.range; ++i) {
                currentPos.addInplace(offset);

                const contents = this.root.map.getTileContent(currentPos);
                if (!contents) {
                    continue;
                }

                const contentsStaticComp = contents.components.StaticMapEntity;
                const contentsBeltComp = contents.components.Belt;

                if (contentsBeltComp) {
                    // It's a belt
                    if (
                        contentsBeltComp.direction === enumDirection.top &&
                        enumAngleToDirection[contentsStaticComp.rotation] === direction
                    ) {
                        // It's same rotation, drop it
                        this.root.logic.tryDeleteBuilding(contents);
                    }
                }
            }

            // Remove any double tunnels, by checking the tile plus the tile above
            currentPos = tile.copy().add(offset);
            for (let i = 0; i < matchingEntrance.range - 1; ++i) {
                const posBefore = currentPos.copy();
                currentPos.addInplace(offset);

                const entityBefore = this.root.map.getTileContent(posBefore);
                const entityAfter = this.root.map.getTileContent(currentPos);

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
     *
     * @param {Entity} entity
     */
    handleSender(entity) {
        const staticComp = entity.components.StaticMapEntity;
        const undergroundComp = entity.components.UndergroundBelt;

        // Check if we have any item

        if (undergroundComp.pendingItems.length > 0) {
            const nextItemAndDuration = undergroundComp.pendingItems[0];
            const remainingTime = nextItemAndDuration[1];
            const nextItem = nextItemAndDuration[0];

            if (remainingTime === 0) {
                // Try to find a receiver
                const searchDirection = staticComp.localDirectionToWorld(enumDirection.top);
                const searchVector = enumDirectionToVector[searchDirection];
                const targetRotation = enumDirectionToAngle[searchDirection];

                let currentTile = staticComp.origin;

                for (
                    let searchOffset = 0;
                    searchOffset < globalConfig.undergroundBeltMaxTilesByTier[undergroundComp.tier];
                    ++searchOffset
                ) {
                    currentTile = currentTile.add(searchVector);

                    const contents = this.root.map.getTileContent(currentTile);
                    if (contents) {
                        const receiverUndergroundComp = contents.components.UndergroundBelt;
                        if (
                            receiverUndergroundComp &&
                            receiverUndergroundComp.tier === undergroundComp.tier
                        ) {
                            const receiverStaticComp = contents.components.StaticMapEntity;
                            if (receiverStaticComp.rotation === targetRotation) {
                                if (receiverUndergroundComp.mode === enumUndergroundBeltMode.receiver) {
                                    // Try to pass over the item to the receiver
                                    if (
                                        receiverUndergroundComp.tryAcceptTunneledItem(
                                            nextItem,
                                            searchOffset,
                                            this.root.hubGoals.getUndergroundBeltBaseSpeed()
                                        )
                                    ) {
                                        undergroundComp.pendingItems = [];
                                    }
                                }

                                // When we hit some underground belt, always stop, no matter what
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     *
     * @param {Entity} entity
     */
    handleReceiver(entity) {
        const undergroundComp = entity.components.UndergroundBelt;

        // Try to eject items, we only check the first one cuz its sorted by remaining time
        const items = undergroundComp.pendingItems;
        if (items.length > 0) {
            const nextItemAndDuration = undergroundComp.pendingItems[0];
            const remainingTime = nextItemAndDuration[1];
            const nextItem = nextItemAndDuration[0];

            if (remainingTime <= 0) {
                const ejectorComp = entity.components.ItemEjector;
                const nextSlotIndex = ejectorComp.getFirstFreeSlot();
                if (nextSlotIndex !== null) {
                    if (ejectorComp.tryEject(nextSlotIndex, nextItem)) {
                        items.shift();
                    }
                }
            }
        }
    }
}
