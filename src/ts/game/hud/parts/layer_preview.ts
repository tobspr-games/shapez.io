import { freeCanvas, makeOffscreenBuffer } from "../../../core/buffer_utils";
import { globalConfig } from "../../../core/config";
import { Loader } from "../../../core/loader";
import { Vector } from "../../../core/vector";
import { MapChunkView } from "../../map_chunk_view";
import { THEME } from "../../theme";
import { BaseHUDPart } from "../base_hud_part";
/**
 * Helper class which allows peaking through to the wires layer
 */
export class HUDLayerPreview extends BaseHUDPart {
    initialize(): any {
        this.initializeCanvas();
        this.root.signals.aboutToDestruct.add((): any => freeCanvas(this.canvas));
        this.root.signals.resized.add(this.initializeCanvas, this);
        this.previewOverlay = Loader.getSprite("sprites/wires/wires_preview.png");
    }
    /**
     * (re) initializes the canvas
     */
    initializeCanvas(): any {
        if (this.canvas) {
            freeCanvas(this.canvas);
            delete this.canvas;
            delete this.context;
        }
        // Compute how big the preview should be
        this.previewSize = Math.round(Math.min(1024, Math.min(this.root.gameWidth, this.root.gameHeight) * 0.8));
        const [canvas, context]: any = makeOffscreenBuffer(this.previewSize, this.previewSize, {
            smooth: true,
            label: "layerPeeker",
            reusable: true,
        });
        context.clearRect(0, 0, this.previewSize, this.previewSize);
        this.canvas = canvas;
        this.context = context;
    }
    /**
     * Prepares the canvas to render at the given worldPos and the given camera scale
     *
     */
    prepareCanvasForPreview(worldPos: Vector, scale: number): any {
        this.context.clearRect(0, 0, this.previewSize, this.previewSize);
        this.context.fillStyle = THEME.map.wires.previewColor;
        this.context.fillRect(0, 0, this.previewSize, this.previewSize);
        const dimensions: any = scale * this.previewSize;
        const startWorldX: any = worldPos.x - dimensions / 2;
        const startWorldY: any = worldPos.y - dimensions / 2;
        const startTileX: any = Math.floor(startWorldX / globalConfig.tileSize);
        const startTileY: any = Math.floor(startWorldY / globalConfig.tileSize);
        const tileDimensions: any = Math.ceil(dimensions / globalConfig.tileSize);
        this.context.save();
        this.context.scale(1 / scale, 1 / scale);
        this.context.translate(startTileX * globalConfig.tileSize - startWorldX, startTileY * globalConfig.tileSize - startWorldY);
        for (let dx: any = 0; dx < tileDimensions; ++dx) {
            for (let dy: any = 0; dy < tileDimensions; ++dy) {
                const tileX: any = dx + startTileX;
                const tileY: any = dy + startTileY;
                const content: any = this.root.map.getLayerContentXY(tileX, tileY, "wires");
                if (content) {
                    MapChunkView.drawSingleWiresOverviewTile({
                        context: this.context,
                        x: dx * globalConfig.tileSize,
                        y: dy * globalConfig.tileSize,
                        entity: content,
                        tileSizePixels: globalConfig.tileSize,
                    });
                }
            }
        }
        this.context.restore();
        this.context.globalCompositeOperation = "destination-in";
        this.previewOverlay.draw(this.context, 0, 0, this.previewSize, this.previewSize);
        this.context.globalCompositeOperation = "source-over";
        return this.canvas;
    }
    /**
     * Renders the preview at the given position
     */
    renderPreview(parameters: import("../../../core/draw_utils").DrawParameters, worldPos: Vector, scale: number): any {
        if (this.root.currentLayer !== "regular") {
            // Only supporting wires right now
            return;
        }
        const canvas: any = this.prepareCanvasForPreview(worldPos, scale);
        parameters.context.globalAlpha = 0.3;
        parameters.context.drawImage(canvas, worldPos.x - (scale * this.previewSize) / 2, worldPos.y - (scale * this.previewSize) / 2, scale * this.previewSize, scale * this.previewSize);
        parameters.context.globalAlpha = 1;
    }
}
