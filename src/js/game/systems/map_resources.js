import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { GameSystem } from "../game_system";
import { MapChunkView } from "../map_chunk_view";
import { THEME } from "../theme";

export class MapResourcesSystem extends GameSystem {
    /**
     * Draws the map resources
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const basicChunkBackground = this.root.buffers.getForKey({
            key: "chunkres",
            subKey: chunk.renderKey,
            w: globalConfig.mapChunkSize,
            h: globalConfig.mapChunkSize,
            dpi: 1,
            redrawMethod: this.generateChunkBackground.bind(this, chunk),
        });

        parameters.context.imageSmoothingEnabled = false;
        parameters.context.drawImage(
            basicChunkBackground,
            chunk.tileX * globalConfig.tileSize,
            chunk.tileY * globalConfig.tileSize,
            globalConfig.mapChunkWorldSize,
            globalConfig.mapChunkWorldSize
        );
        parameters.context.imageSmoothingEnabled = true;

        parameters.context.globalAlpha = 0.5;

        if (this.root.app.settings.getAllSettings().lowQualityMapResources) {
            // LOW QUALITY: Draw patch items only
            for (let i = 0; i < chunk.patches.length; ++i) {
                const patch = chunk.patches[i];

                patch.item.draw(
                    chunk.x * globalConfig.mapChunkWorldSize + patch.pos.x * globalConfig.tileSize,
                    chunk.y * globalConfig.mapChunkWorldSize + patch.pos.y * globalConfig.tileSize,
                    parameters,
                    Math.min(80, 40 / parameters.zoomLevel)
                );
            }
        } else {
            // HIGH QUALITY: Draw all items
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

                        // parameters.context.fillStyle = lowerItem.getBackgroundColorAsResource();
                        // parameters.context.fillRect(worldX, worldY, globalConfig.tileSize, globalConfig.tileSize);
                        lowerItem.draw(
                            worldX + globalConfig.halfTileSize,
                            worldY + globalConfig.halfTileSize,
                            parameters
                        );
                    }
                }
            }
        }
        parameters.context.globalAlpha = 1;
    }

    /**
     *
     * @param {MapChunkView} chunk
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    generateChunkBackground(chunk, canvas, context, w, h, dpi) {
        if (this.root.app.settings.getAllSettings().disableTileGrid) {
            // The map doesn't draw a background, so we have to

            context.fillStyle = THEME.map.background;
            context.fillRect(0, 0, w, h);
        } else {
            context.clearRect(0, 0, w, h);
        }

        context.globalAlpha = 0.5;
        const layer = chunk.lowerLayer;
        for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
            const row = layer[x];
            for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                const item = row[y];
                if (item) {
                    context.fillStyle = item.getBackgroundColorAsResource();
                    context.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}
