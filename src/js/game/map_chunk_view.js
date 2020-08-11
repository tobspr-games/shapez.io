import { MapChunk } from "./map_chunk";
import { GameRoot, enumLayer } from "./root";
import { DrawParameters } from "../core/draw_parameters";
import { smoothenDpi } from "../core/dpi_manager";
import { globalConfig } from "../core/config";
import { THEME } from "./theme";
import { getBuildingDataFromCode } from "./building_codes";

const CHUNK_OVERLAY_RES = 3;

export class MapChunkView extends MapChunk {
    /**
     *
     * @param {GameRoot} root
     * @param {number} x
     * @param {number} y
     */
    constructor(root, x, y) {
        super(root, x, y);

        /**
         * Whenever something changes, we increase this number - so we know we need to redraw
         */
        this.renderIteration = 0;

        this.markDirty();
    }

    /**
     * Marks this chunk as dirty, rerendering all caches
     */
    markDirty() {
        ++this.renderIteration;
        this.renderKey = this.x + "/" + this.y + "@" + this.renderIteration;
    }

    /**
     * Draws the background layer
     * @param {DrawParameters} parameters
     */
    drawBackgroundLayer(parameters) {
        const systems = this.root.systemMgr.systems;
        systems.mapResources.drawChunk(parameters, this);
        systems.belt.drawChunk(parameters, this);
    }

    /**
     * Draws the foreground layer
     * @param {DrawParameters} parameters
     */
    drawForegroundLayer(parameters) {
        const systems = this.root.systemMgr.systems;
        systems.miner.drawChunk(parameters, this);
        systems.staticMapEntities.drawChunk(parameters, this);
    }

    /**
     * Overlay
     * @param {DrawParameters} parameters
     */
    drawOverlay(parameters) {
        const sprite = this.root.buffers.getForKey({
            key: "chunk@" + this.root.currentLayer,
            subKey: this.renderKey,
            w: globalConfig.mapChunkSize * CHUNK_OVERLAY_RES,
            h: globalConfig.mapChunkSize * CHUNK_OVERLAY_RES,
            dpi: 1,
            redrawMethod: this.generateOverlayBuffer.bind(this),
        });

        const dims = globalConfig.mapChunkSize * globalConfig.tileSize;

        parameters.context.imageSmoothingEnabled = false;

        parameters.context.drawImage(sprite, this.x * dims, this.y * dims, dims, dims);
        parameters.context.imageSmoothingEnabled = true;

        if (this.root.currentLayer === enumLayer.regular) {
            for (let i = 0; i < this.patches.length; ++i) {
                const patch = this.patches[i];

                patch.item.draw(
                    this.x * dims + patch.pos.x * globalConfig.tileSize,
                    this.y * dims + patch.pos.y * globalConfig.tileSize,
                    parameters,
                    Math.min(80, 30 / parameters.zoomLevel)
                );
            }
        }
    }

    /**
     *
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    generateOverlayBuffer(canvas, context, w, h, dpi) {
        context.fillStyle =
            this.containedEntities.length > 0
                ? THEME.map.chunkOverview.filled
                : THEME.map.chunkOverview.empty;
        context.fillRect(0, 0, w, h);

        for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
            const lowerArray = this.lowerLayer[x];
            const upperArray = this.contents[x];
            for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                const upperContent = upperArray[y];
                if (upperContent) {
                    const staticComp = upperContent.components.StaticMapEntity;
                    const data = getBuildingDataFromCode(staticComp.code);
                    const metaBuilding = data.metaInstance;

                    const overlayMatrix = metaBuilding.getSpecialOverlayRenderMatrix(
                        staticComp.rotation,
                        data.rotationVariant,
                        data.variant,
                        upperContent
                    );

                    if (overlayMatrix) {
                        // Draw lower content first since it "shines" through
                        const lowerContent = lowerArray[y];
                        if (lowerContent) {
                            context.fillStyle = lowerContent.getBackgroundColorAsResource();
                            context.fillRect(
                                x * CHUNK_OVERLAY_RES,
                                y * CHUNK_OVERLAY_RES,
                                CHUNK_OVERLAY_RES,
                                CHUNK_OVERLAY_RES
                            );
                        }

                        context.fillStyle = metaBuilding.getSilhouetteColor();
                        for (let dx = 0; dx < 3; ++dx) {
                            for (let dy = 0; dy < 3; ++dy) {
                                const isFilled = overlayMatrix[dx + dy * 3];
                                if (isFilled) {
                                    context.fillRect(
                                        x * CHUNK_OVERLAY_RES + dx,
                                        y * CHUNK_OVERLAY_RES + dy,
                                        1,
                                        1
                                    );
                                }
                            }
                        }

                        continue;
                    } else {
                        context.fillStyle = metaBuilding.getSilhouetteColor();
                        context.fillRect(
                            x * CHUNK_OVERLAY_RES,
                            y * CHUNK_OVERLAY_RES,
                            CHUNK_OVERLAY_RES,
                            CHUNK_OVERLAY_RES
                        );

                        continue;
                    }
                }

                const lowerContent = lowerArray[y];
                if (lowerContent) {
                    context.fillStyle = lowerContent.getBackgroundColorAsResource();
                    context.fillRect(
                        x * CHUNK_OVERLAY_RES,
                        y * CHUNK_OVERLAY_RES,
                        CHUNK_OVERLAY_RES,
                        CHUNK_OVERLAY_RES
                    );
                }
            }
        }

        if (this.root.currentLayer === enumLayer.wires) {
            // Draw wires overlay

            context.fillStyle = THEME.map.wires.overlayColor;
            context.fillRect(0, 0, w, h);

            for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                const wiresArray = this.wireContents[x];
                for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                    const content = wiresArray[y];
                    if (!content) {
                        continue;
                    }
                    const staticComp = content.components.StaticMapEntity;
                    const data = getBuildingDataFromCode(staticComp.code);
                    const metaBuilding = data.metaInstance;

                    const overlayMatrix = metaBuilding.getSpecialOverlayRenderMatrix(
                        staticComp.rotation,
                        data.rotationVariant,
                        data.variant,
                        content
                    );

                    context.fillStyle = metaBuilding.getSilhouetteColor();
                    if (overlayMatrix) {
                        for (let dx = 0; dx < 3; ++dx) {
                            for (let dy = 0; dy < 3; ++dy) {
                                const isFilled = overlayMatrix[dx + dy * 3];
                                if (isFilled) {
                                    context.fillRect(
                                        x * CHUNK_OVERLAY_RES + dx,
                                        y * CHUNK_OVERLAY_RES + dy,
                                        1,
                                        1
                                    );
                                }
                            }
                        }

                        continue;
                    } else {
                        context.fillRect(
                            x * CHUNK_OVERLAY_RES,
                            y * CHUNK_OVERLAY_RES,
                            CHUNK_OVERLAY_RES,
                            CHUNK_OVERLAY_RES
                        );

                        continue;
                    }
                }
            }
        }
    }

    /**
     * Draws the wires layer
     * @param {DrawParameters} parameters
     */
    drawWiresForegroundLayer(parameters) {
        const systems = this.root.systemMgr.systems;
        systems.wire.drawChunk(parameters, this);
        systems.staticMapEntities.drawWiresChunk(parameters, this);
    }
}
