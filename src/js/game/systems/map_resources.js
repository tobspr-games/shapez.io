import { GameSystem } from "../game_system";
import { DrawParameters } from "../../core/draw_parameters";
import { globalConfig } from "../../core/config";
import { MapChunkView } from "../map_chunk_view";

export class MapResourcesSystem extends GameSystem {
    /**
     * Draws the map resources
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const renderItems = parameters.zoomLevel >= globalConfig.mapChunkOverviewMinZoom;

        parameters.context.globalAlpha = 0.5;
        const layer = chunk.lowerLayer;
        for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
            const row = layer[x];
            for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                const lowerItem = row[y];
                if (lowerItem) {
                    parameters.context.fillStyle = lowerItem.getBackgroundColorAsResource();
                    parameters.context.fillRect(
                        (chunk.tileX + x) * globalConfig.tileSize,
                        (chunk.tileY + y) * globalConfig.tileSize,
                        globalConfig.tileSize,
                        globalConfig.tileSize
                    );
                    if (renderItems) {
                        lowerItem.draw(
                            (chunk.tileX + x + 0.5) * globalConfig.tileSize,
                            (chunk.tileY + y + 0.5) * globalConfig.tileSize,
                            parameters
                        );
                    }
                }
            }
        }
        parameters.context.globalAlpha = 1;

        if (!renderItems) {
            // Render patches instead
            const patches = chunk.patches;
            for (let i = 0; i < patches.length; ++i) {
                const { pos, item, size } = patches[i];

                item.draw(
                    (chunk.tileX + pos.x + 0.5) * globalConfig.tileSize,
                    (chunk.tileY + pos.y + 0.5) * globalConfig.tileSize,
                    parameters,
                    80
                );
            }
        }
    }
}
