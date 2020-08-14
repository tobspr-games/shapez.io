import { freeCanvas, makeOffscreenBuffer } from "../../../core/buffer_utils";
import { globalConfig } from "../../../core/config";
import { Loader } from "../../../core/loader";
import { Vector } from "../../../core/vector";
import { getBuildingDataFromCode } from "../../building_codes";
import { enumLayer } from "../../root";
import { BaseHUDPart } from "../base_hud_part";

const PREVIEW_SIZE = 512;

/**
 * Helper class which allows peaking through to the wires layer
 */
export class HUDLayerPreview extends BaseHUDPart {
    initialize() {
        const [canvas, context] = makeOffscreenBuffer(PREVIEW_SIZE, PREVIEW_SIZE, {
            smooth: true,
            label: "layerPeeker",
            reusable: true,
        });

        context.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
        context.fillStyle = "red";
        context.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

        this.canvas = canvas;
        this.context = context;

        this.root.signals.aboutToDestruct.add(() => freeCanvas(this.canvas));

        this.previewOverlay = Loader.getSprite("sprites/wires/wires_preview.png");
    }

    /**
     * Prepares the canvas to render at the given worldPos and the given camera scale
     *
     * @param {Vector} worldPos
     * @param {number} scale 1 / zoomLevel
     */
    prepareCanvasForPreview(worldPos, scale) {
        this.context.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
        this.context.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.context.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

        const dimensions = scale * PREVIEW_SIZE;

        const startWorldX = worldPos.x - dimensions / 2;
        const startWorldY = worldPos.y - dimensions / 2;

        const startTileX = Math.floor(startWorldX / globalConfig.tileSize);
        const startTileY = Math.floor(startWorldY / globalConfig.tileSize);
        const tileDimensions = Math.ceil(dimensions / globalConfig.tileSize);
        console.log(startTileX, startTileY);

        this.context.save();
        this.context.scale(1 / scale, 1 / scale);
        this.context.translate(
            startTileX * globalConfig.tileSize - startWorldX,
            startTileY * globalConfig.tileSize - startWorldY
        );

        for (let dx = 0; dx < tileDimensions; ++dx) {
            for (let dy = 0; dy < tileDimensions; ++dy) {
                const tileX = dx + startTileX;
                const tileY = dy + startTileY;

                const content = this.root.map.getLayerContentXY(tileX, tileY, enumLayer.wires);
                if (content) {
                    const staticComp = content.components.StaticMapEntity;
                    const data = getBuildingDataFromCode(staticComp.code);
                    const metaBuilding = data.metaInstance;
                    const overlayMatrix = metaBuilding.getSpecialOverlayRenderMatrix(
                        staticComp.rotation,
                        data.rotationVariant,
                        data.variant,
                        content
                    );

                    this.context.fillStyle = metaBuilding.getSilhouetteColor();
                    if (overlayMatrix) {
                        for (let subX = 0; subX < 3; ++subX) {
                            for (let subY = 0; subY < 3; ++subY) {
                                const isFilled = overlayMatrix[subX + subY * 3];
                                if (isFilled) {
                                    this.context.fillRect(
                                        dx * globalConfig.tileSize + (subX * globalConfig.tileSize) / 3,
                                        dy * globalConfig.tileSize + (subY * globalConfig.tileSize) / 3,
                                        globalConfig.tileSize / 3,
                                        globalConfig.tileSize / 3
                                    );
                                }
                            }
                        }
                    } else {
                        this.context.fillRect(
                            dx * globalConfig.tileSize,
                            dy * globalConfig.tileSize,
                            globalConfig.tileSize,
                            globalConfig.tileSize
                        );
                    }

                    // this.context.fillStyle = "green";
                    // this.context.fillRect(
                    //     dx * globalConfig.tileSize,
                    //     dy * globalConfig.tileSize,

                    //     globalConfig.tileSize,
                    //     globalConfig.tileSize
                    // );
                }
            }
        }

        this.context.restore();
        this.context.globalCompositeOperation = "source-in";
        this.previewOverlay.draw(this.context, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
        this.context.globalCompositeOperation = "source-over";

        return this.canvas;
    }

    /**
     * Renders the preview at the given position
     * @param {import("../../../core/draw_utils").DrawParameters} parameters
     * @param {Vector} worldPos
     * @param {number} scale 1 / zoomLevel
     */
    renderPreview(parameters, worldPos, scale) {
        if (this.root.currentLayer !== enumLayer.regular) {
            // Only supporting wires right now
            return;
        }

        const canvas = this.prepareCanvasForPreview(worldPos, scale);

        parameters.context.drawImage(
            canvas,
            worldPos.x - (scale * PREVIEW_SIZE) / 2,
            worldPos.y - (scale * PREVIEW_SIZE) / 2,
            scale * PREVIEW_SIZE,
            scale * PREVIEW_SIZE
        );
    }
}
