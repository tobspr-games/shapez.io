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

            if (!minerComp.cachedMinedItem) {
                const staticComp = entity.components.StaticMapEntity;
                const tileBelow = this.root.map.getLowerLayerContentXY(
                    staticComp.origin.x,
                    staticComp.origin.y
                );
                if (!tileBelow) {
                    continue;
                }
                minerComp.cachedMinedItem = tileBelow;
            }

            // First, try to get rid of chained items
            if (minerComp.itemChainBuffer.length > 0) {
                if (this.tryPerformMinerEject(entity, minerComp.itemChainBuffer[0])) {
                    minerComp.itemChainBuffer.shift();
                    continue;
                }
            }

            if (this.root.time.isIngameTimerExpired(minerComp.lastMiningTime, 1 / miningSpeed)) {
                if (this.tryPerformMinerEject(entity, minerComp.cachedMinedItem)) {
                    // Analytics hook
                    this.root.signals.itemProduced.dispatch(minerComp.cachedMinedItem);

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
            const targetContents = this.root.map.getTileContent(targetTile, "regular");

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
        const contents = chunk.containedEntitiesByLayer.regular;

        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const minerComp = entity.components.Miner;
            if (!minerComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            if (!minerComp.cachedMinedItem) {
                continue;
            }

            // Draw the item background - this is to hide the ejected item animation from
            // the item ejecto

            const padding = 3;
            const destX = staticComp.origin.x * globalConfig.tileSize + padding;
            const destY = staticComp.origin.y * globalConfig.tileSize + padding;
            const dimensions = globalConfig.tileSize - 2 * padding;

            if (parameters.visibleRect.containsRect4Params(destX, destY, dimensions, dimensions)) {
                parameters.context.fillStyle = minerComp.cachedMinedItem.getBackgroundColorAsResource();
                parameters.context.fillRect(destX, destY, dimensions, dimensions);
            }

            minerComp.cachedMinedItem.drawItemCenteredClipped(
                (0.5 + staticComp.origin.x) * globalConfig.tileSize,
                (0.5 + staticComp.origin.y) * globalConfig.tileSize,
                parameters,
                globalConfig.defaultItemDiameter
            );
        }
    }
}
