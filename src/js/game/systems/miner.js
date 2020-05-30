import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { enumDirectionToVector } from "../../core/vector";
import { BaseItem } from "../base_item";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";

export class MinerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [MinerComponent]);
    }

    update() {
        let miningSpeed = this.root.hubGoals.getMinerBaseSpeed();
        if (G_IS_DEV && globalConfig.debug.instantMiners) {
            miningSpeed *= 100;
        }

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            // Check if miner is above an actual tile

            const minerComp = entity.components.Miner;
            const staticComp = entity.components.StaticMapEntity;

            const tileBelow = this.root.map.getLowerLayerContentXY(staticComp.origin.x, staticComp.origin.y);
            if (!tileBelow) {
                continue;
            }

            // First, try to get rid of chained items
            if (minerComp.itemChainBuffer.length > 0) {
                if (this.tryPerformMinerEject(entity, minerComp.itemChainBuffer[0])) {
                    minerComp.itemChainBuffer.shift();
                    continue;
                }
            }

            if (this.root.time.isIngameTimerExpired(minerComp.lastMiningTime, 1 / miningSpeed)) {
                const lowerLayerItem = this.root.map.getLowerLayerContentXY(
                    staticComp.origin.x,
                    staticComp.origin.y
                );

                // TODO: Should not be required actually
                if (!lowerLayerItem) {
                    // Nothing below;
                    continue;
                }

                if (this.tryPerformMinerEject(entity, lowerLayerItem)) {
                    // Analytics hook
                    this.root.signals.itemProduced.dispatch(lowerLayerItem);

                    // Actually mine
                    minerComp.lastMiningTime = this.root.time.now();
                }
            }
        }
    }

    /**
     *
     * @param {Entity} entity
     * @param {BaseItem} item
     */
    tryPerformMinerEject(entity, item) {
        const minerComp = entity.components.Miner;
        const ejectComp = entity.components.ItemEjector;
        const staticComp = entity.components.StaticMapEntity;

        // Check if we are a chained miner
        if (minerComp.chainable) {
            const ejectingSlot = ejectComp.slots[0];
            const ejectingPos = staticComp.localTileToWorld(ejectingSlot.pos);
            const ejectingDirection = staticComp.localDirectionToWorld(ejectingSlot.direction);

            const targetTile = ejectingPos.add(enumDirectionToVector[ejectingDirection]);
            const targetContents = this.root.map.getTileContent(targetTile);

            // Check if we are connected to another miner and thus do not eject directly
            if (targetContents) {
                const targetMinerComp = targetContents.components.Miner;
                if (targetMinerComp) {
                    if (targetMinerComp.tryAcceptChainedItem(item)) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }

        // Seems we are a regular miner or at the end of a row, try actually ejecting
        if (ejectComp.tryEject(0, item)) {
            return true;
        }
        return false;
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.contents;
        for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
            for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                const entity = contents[x][y];

                if (entity && entity.components.Miner) {
                    const staticComp = entity.components.StaticMapEntity;
                    if (!staticComp.shouldBeDrawn(parameters)) {
                        continue;
                    }

                    const lowerLayerItem = this.root.map.getLowerLayerContentXY(
                        staticComp.origin.x,
                        staticComp.origin.y
                    );

                    if (lowerLayerItem) {
                        const padding = 3;
                        parameters.context.fillStyle = lowerLayerItem.getBackgroundColorAsResource();
                        parameters.context.fillRect(
                            staticComp.origin.x * globalConfig.tileSize + padding,
                            staticComp.origin.y * globalConfig.tileSize + padding,
                            globalConfig.tileSize - 2 * padding,
                            globalConfig.tileSize - 2 * padding
                        );
                    }

                    if (lowerLayerItem) {
                        lowerLayerItem.draw(
                            (0.5 + staticComp.origin.x) * globalConfig.tileSize,
                            (0.5 + staticComp.origin.y) * globalConfig.tileSize,
                            parameters
                        );
                    }
                }
            }
        }
    }
}
