import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { GameSystem } from "../game_system";
import { MapChunkView } from "../map_chunk_view";
import { THEME } from "../theme";
import { drawSpriteClipped } from "../../core/draw_utils";
export class MapResourcesSystem extends GameSystem {
    /**
     * Draws the map resources
     */
    drawChunk(parameters: DrawParameters, chunk: MapChunkView): any {
        const basicChunkBackground: any = this.root.buffers.getForKey({
            key: "mapresourcebg",
            subKey: chunk.renderKey,
            w: globalConfig.mapChunkSize,
            h: globalConfig.mapChunkSize,
            dpi: 1,
            redrawMethod: this.generateChunkBackground.bind(this, chunk),
        });
        parameters.context.imageSmoothingEnabled = false;
        drawSpriteClipped({
            parameters,
            sprite: basicChunkBackground,
            x: chunk.tileX * globalConfig.tileSize,
            y: chunk.tileY * globalConfig.tileSize,
            w: globalConfig.mapChunkWorldSize,
            h: globalConfig.mapChunkWorldSize,
            originalW: globalConfig.mapChunkSize,
            originalH: globalConfig.mapChunkSize,
        });
        parameters.context.imageSmoothingEnabled = true;
        parameters.context.globalAlpha = 0.5;
        if (this.root.app.settings.getAllSettings().lowQualityMapResources) {
            // LOW QUALITY: Draw patch items only
            for (let i: any = 0; i < chunk.patches.length; ++i) {
                const patch: any = chunk.patches[i];
                const destX: any = chunk.x * globalConfig.mapChunkWorldSize + patch.pos.x * globalConfig.tileSize;
                const destY: any = chunk.y * globalConfig.mapChunkWorldSize + patch.pos.y * globalConfig.tileSize;
                const diameter: any = Math.min(80, 40 / parameters.zoomLevel);
                patch.item.drawItemCenteredClipped(destX, destY, parameters, diameter);
            }
        }
        else {
            // HIGH QUALITY: Draw all items
            const layer: any = chunk.lowerLayer;
            const layerEntities: any = chunk.contents;
            for (let x: any = 0; x < globalConfig.mapChunkSize; ++x) {
                const row: any = layer[x];
                const rowEntities: any = layerEntities[x];
                const worldX: any = (chunk.tileX + x) * globalConfig.tileSize;
                for (let y: any = 0; y < globalConfig.mapChunkSize; ++y) {
                    const lowerItem: any = row[y];
                    const entity: any = rowEntities[y];
                    if (entity) {
                        // Don't draw if there is an entity above
                        continue;
                    }
                    if (lowerItem) {
                        const worldY: any = (chunk.tileY + y) * globalConfig.tileSize;
                        const destX: any = worldX + globalConfig.halfTileSize;
                        const destY: any = worldY + globalConfig.halfTileSize;
                        lowerItem.drawItemCenteredClipped(destX, destY, parameters, globalConfig.defaultItemDiameter);
                    }
                }
            }
        }
        parameters.context.globalAlpha = 1;
    }
        generateChunkBackground(chunk: MapChunkView, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, w: number, h: number, dpi: number): any {
        if (this.root.app.settings.getAllSettings().disableTileGrid) {
            // The map doesn't draw a background, so we have to
            context.fillStyle = THEME.map.background;
            context.fillRect(0, 0, w, h);
        }
        else {
            context.clearRect(0, 0, w, h);
        }
        context.globalAlpha = 0.5;
        const layer: any = chunk.lowerLayer;
        for (let x: any = 0; x < globalConfig.mapChunkSize; ++x) {
            const row: any = layer[x];
            for (let y: any = 0; y < globalConfig.mapChunkSize; ++y) {
                const item: any = row[y];
                if (item) {
                    context.fillStyle = item.getBackgroundColorAsResource();
                    context.fillRect(x, y, 1, 1);
                }
            }
        }
        if (this.root.app.settings.getAllSettings().displayChunkBorders) {
            context.fillStyle = THEME.map.chunkBorders;
            context.fillRect(0, 0, w, 1);
            context.fillRect(0, 1, 1, h);
        }
    }
}
