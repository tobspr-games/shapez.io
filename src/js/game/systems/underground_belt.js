import { GameSystemWithFilter } from "../game_system_with_filter";
import { UndergroundBeltComponent, enumUndergroundBeltMode } from "../components/underground_belt";
import { Entity } from "../entity";
import { Loader } from "../../core/loader";
import { Math_max } from "../../core/builtins";
import { globalConfig } from "../../core/config";
import { enumDirection, enumDirectionToVector, enumDirectionToAngle } from "../../core/vector";
import { MapChunkView } from "../map_chunk_view";
import { DrawParameters } from "../../core/draw_parameters";

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
