import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { MinerComponent } from "../components/miner";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { ShapeItem } from "../items/shape_item";

export class MinerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [MinerComponent]);
    }

    update() {
        const miningSpeed = this.root.hubGoals.getMinerBaseSpeed();
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const minerComp = entity.components.Miner;
            const staticComp = entity.components.StaticMapEntity;
            const ejectComp = entity.components.ItemEjector;

            if (this.root.time.isIngameTimerExpired(minerComp.lastMiningTime, 1 / miningSpeed)) {
                if (!ejectComp.canEjectOnSlot(0)) {
                    // We can't eject further
                    continue;
                }

                // Actually mine
                minerComp.lastMiningTime = this.root.time.now();

                const lowerLayerItem = this.root.map.getLowerLayerContentXY(
                    staticComp.origin.x,
                    staticComp.origin.y
                );
                if (!lowerLayerItem) {
                    // Nothing below;
                    continue;
                }

                // Analytics hook
                this.root.signals.itemProduced.dispatch(lowerLayerItem);

                // Try actually ejecting
                if (!ejectComp.tryEject(0, lowerLayerItem)) {
                    assert(false, "Failed to eject");
                }
            }
        }
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
