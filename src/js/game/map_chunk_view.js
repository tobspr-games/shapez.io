import { MapChunk } from "./map_chunk";
import { GameRoot } from "./root";
import { globalConfig } from "../core/config";
import { DrawParameters } from "../core/draw_parameters";
import { round1Digit } from "../core/utils";
import { Rectangle } from "../core/rectangle";
import { createLogger } from "../core/logging";
import { smoothenDpi } from "../core/dpi_manager";
import { THEME } from "./theme";

const logger = createLogger("chunk");
const chunkSizePixels = globalConfig.mapChunkSize * globalConfig.tileSize;

export class MapChunkView extends MapChunk {
    /**
     *
     * @param {GameRoot} root
     * @param {number} x
     * @param {number} y
     */
    constructor(root, x, y) {
        super(root, x, y);

        this.boundInternalDrawBackgroundToContext = this.internalDrawBackgroundToContext.bind(this);
        this.boundInternalDrawForegroundToContext = this.internalDrawForegroundToContext.bind(this);
        this.boundInternalDrawWiresToContext = this.internalDrawWiresToContext.bind(this);

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
        if (parameters.zoomLevel > globalConfig.mapChunkPrerenderMinZoom) {
            this.internalDrawBackgroundSystems(parameters);
            return;
        }

        const dpi = smoothenDpi(parameters.zoomLevel);
        const buffer = this.root.buffers.getForKey(
            "" + dpi,
            this.renderKey + "@bg",
            chunkSizePixels,
            chunkSizePixels,
            dpi,
            this.boundInternalDrawBackgroundToContext,
            { zoomLevel: parameters.zoomLevel }
        );

        parameters.context.drawImage(
            buffer,
            this.tileX * globalConfig.tileSize,
            this.tileY * globalConfig.tileSize,
            chunkSizePixels,
            chunkSizePixels
        );
    }

    /**
     * Draws the foreground layer
     * @param {DrawParameters} parameters
     */
    drawForegroundLayer(parameters) {
        if (parameters.zoomLevel > globalConfig.mapChunkPrerenderMinZoom) {
            this.internalDrawForegroundSystems(parameters);
            return;
        }

        const dpi = smoothenDpi(parameters.zoomLevel);
        const buffer = this.root.buffers.getForKey(
            "" + dpi,
            this.renderKey + "@fg",
            chunkSizePixels,
            chunkSizePixels,
            dpi,
            this.boundInternalDrawForegroundToContext,
            { zoomLevel: parameters.zoomLevel }
        );
        parameters.context.drawImage(
            buffer,
            this.tileX * globalConfig.tileSize,
            this.tileY * globalConfig.tileSize,
            chunkSizePixels,
            chunkSizePixels
        );
    }

    /**
     * Draws the wires layer
     * @param {DrawParameters} parameters
     */
    drawWiresLayer(parameters) {
        if (parameters.zoomLevel > globalConfig.mapChunkPrerenderMinZoom) {
            this.internalDrawWireSystems(parameters);
            return;
        }

        const dpi = smoothenDpi(parameters.zoomLevel);
        const buffer = this.root.buffers.getForKey(
            "" + dpi,
            this.renderKey + "@wire",
            chunkSizePixels,
            chunkSizePixels,
            dpi,
            this.boundInternalDrawWiresToContext,
            { zoomLevel: parameters.zoomLevel }
        );
        parameters.context.drawImage(
            buffer,
            this.tileX * globalConfig.tileSize,
            this.tileY * globalConfig.tileSize,
            chunkSizePixels,
            chunkSizePixels
        );
    }

    /**
     *
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    internalDrawBackgroundToContext(canvas, context, w, h, dpi, { zoomLevel }) {
        const pattern = context.createPattern(this.root.map.cachedBackgroundCanvas, "repeat");
        context.scale(dpi, dpi);

        if (zoomLevel >= globalConfig.mapChunkOverviewMinZoom) {
            const bgDpi = this.root.map.backgroundCacheDPI;
            context.scale(1 / bgDpi, 1 / bgDpi);
            context.fillStyle = pattern;
            context.fillRect(0, 0, chunkSizePixels * bgDpi, chunkSizePixels * bgDpi);
            context.scale(bgDpi, bgDpi);
        } else {
            if (this.containedEntities.length > 0) {
                context.fillStyle = THEME.map.chunkOverview.filled;
            } else {
                context.fillStyle = THEME.map.chunkOverview.empty;
            }
            context.fillRect(0, 0, 10000, 10000);
        }

        if (G_IS_DEV && globalConfig.debug.showChunkBorders) {
            context.fillStyle = "rgba(0, 0, 255, 0.1)";
            context.fillRect(0, 0, 10000, 10000);
        }

        const parameters = new DrawParameters({
            context,
            visibleRect: new Rectangle(
                this.tileX * globalConfig.tileSize,
                this.tileY * globalConfig.tileSize,
                chunkSizePixels,
                chunkSizePixels
            ),
            desiredAtlasScale: "1",
            zoomLevel,
            root: this.root,
        });

        parameters.context.translate(
            -this.tileX * globalConfig.tileSize,
            -this.tileY * globalConfig.tileSize
        );
        this.internalDrawBackgroundSystems(parameters);
    }

    /**
     *
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    internalDrawForegroundToContext(canvas, context, w, h, dpi, { zoomLevel }) {
        context.scale(dpi, dpi);

        const parameters = new DrawParameters({
            context,
            visibleRect: new Rectangle(
                this.tileX * globalConfig.tileSize,
                this.tileY * globalConfig.tileSize,
                chunkSizePixels,
                chunkSizePixels
            ),
            desiredAtlasScale: "1",
            zoomLevel,
            root: this.root,
        });
        parameters.context.translate(
            -this.tileX * globalConfig.tileSize,
            -this.tileY * globalConfig.tileSize
        );
        this.internalDrawForegroundSystems(parameters);
    }

    /**
     *
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    internalDrawWiresToContext(canvas, context, w, h, dpi, { zoomLevel }) {
        context.scale(dpi, dpi);
        const parameters = new DrawParameters({
            context,
            visibleRect: new Rectangle(
                this.tileX * globalConfig.tileSize,
                this.tileY * globalConfig.tileSize,
                chunkSizePixels,
                chunkSizePixels
            ),
            desiredAtlasScale: "1",
            zoomLevel,
            root: this.root,
        });
        parameters.context.translate(
            -this.tileX * globalConfig.tileSize,
            -this.tileY * globalConfig.tileSize
        );
        this.internalDrawWireSystems(parameters);
    }

    /**
     * @param {DrawParameters} parameters
     */
    internalDrawBackgroundSystems(parameters) {
        const systems = this.root.systemMgr.systems;
        systems.mapResources.drawChunk(parameters, this);
        systems.belt.drawChunk(parameters, this);
    }

    /**
     * @param {DrawParameters} parameters
     */
    internalDrawWireSystems(parameters) {
        const systems = this.root.systemMgr.systems;

        systems.belt.drawWiresChunk(parameters, this);
        systems.staticMapEntities.drawWiresChunk(parameters, this);
    }

    /**
     * @param {DrawParameters} parameters
     */
    internalDrawForegroundSystems(parameters) {
        const systems = this.root.systemMgr.systems;
        systems.miner.drawChunk(parameters, this);
        systems.staticMapEntities.drawChunk(parameters, this);
    }
}
