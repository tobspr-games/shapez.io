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
        parameters.context.globalAlpha = 0.5;

        const layer = chunk.lowerLayer;
        for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
            const row = layer[x];
            const worldX = (chunk.tileX + x) * globalConfig.tileSize;
            for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                const lowerItem = row[y];
                if (lowerItem) {
                    const worldY = (chunk.tileY + y) * globalConfig.tileSize;

                    if (
                        !parameters.visibleRect.containsRect4Params(
                            worldX,
                            worldY,
                            globalConfig.tileSize,
                            globalConfig.tileSize
                        )
                    ) {
                        // Clipped
                        continue;
                    }

                    parameters.context.fillStyle = lowerItem.getBackgroundColorAsResource();
                    parameters.context.fillRect(worldX, worldY, globalConfig.tileSize, globalConfig.tileSize);
                    lowerItem.draw(
                        worldX + globalConfig.halfTileSize,
                        worldY + globalConfig.halfTileSize,
                        parameters
                    );
                }
            }
        }
        parameters.context.globalAlpha = 1;
    }
}
