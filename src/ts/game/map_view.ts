import { globalConfig } from "../core/config";
import { DrawParameters } from "../core/draw_parameters";
import { BaseMap } from "./map";
import { freeCanvas, makeOffscreenBuffer } from "../core/buffer_utils";
import { Entity } from "./entity";
import { THEME } from "./theme";
import { MapChunkView } from "./map_chunk_view";
import { MapChunkAggregate } from "./map_chunk_aggregate";
/**
 * This is the view of the map, it extends the map which is the raw model and allows
 * to draw it
 */
export class MapView extends BaseMap {
    public backgroundCacheDPI = 2;
    public cachedBackgroundCanvases: {
        [idx: string]: HTMLCanvasElement | null;
    } = {
        regular: null,
        placing: null,
    };
    public cachedBackgroundContext: CanvasRenderingContext2D = null;

    constructor(root) {
        super(root);
        this.internalInitializeCachedBackgroundCanvases();
        this.root.signals.aboutToDestruct.add(this.cleanup, this);
        this.root.signals.entityAdded.add(this.onEntityChanged, this);
        this.root.signals.entityDestroyed.add(this.onEntityChanged, this);
        this.root.signals.entityChanged.add(this.onEntityChanged, this);
    }
    cleanup() {
        for (const key in this.cachedBackgroundCanvases) {
            freeCanvas(this.cachedBackgroundCanvases[key]);
            this.cachedBackgroundCanvases[key] = null;
        }
    }
    /**
     * Called when an entity was added, removed or changed
     */
    onEntityChanged(entity: Entity) {
        const staticComp = entity.components.StaticMapEntity;
        if (staticComp) {
            const rect = staticComp.getTileSpaceBounds();
            for (let x = rect.x; x <= rect.right(); ++x) {
                for (let y = rect.y; y <= rect.bottom(); ++y) {
                    this.root.map.getOrCreateChunkAtTile(x, y).markDirty();
                }
            }
        }
    }
    /**
     * Draws all static entities like buildings etc.
     */
    drawStaticEntityDebugOverlays(drawParameters: DrawParameters) {
        if (G_IS_DEV && (globalConfig.debug.showAcceptorEjectors || globalConfig.debug.showEntityBounds)) {
            const cullRange = drawParameters.visibleRect.toTileCullRectangle();
            const top = cullRange.top();
            const right = cullRange.right();
            const bottom = cullRange.bottom();
            const left = cullRange.left();
            const border = 1;
            const minY = top - border;
            const maxY = bottom + border;
            const minX = left - border;
            const maxX = right + border - 1;
            // Render y from top down for proper blending
            for (let y = minY; y <= maxY; ++y) {
                for (let x = minX; x <= maxX; ++x) {
                    // const content = this.tiles[x][y];
                    const chunk = this.getChunkAtTileOrNull(x, y);
                    if (!chunk) {
                        continue;
                    }
                    const content = chunk.getTileContentFromWorldCoords(x, y);
                    if (content) {
                        let isBorder = x <= left - 1 || x >= right + 1 || y <= top - 1 || y >= bottom + 1;
                        if (!isBorder) {
                            content.drawDebugOverlays(drawParameters);
                        }
                    }
                }
            }
        }
    }
    /**
     * Initializes all canvases used for background rendering
     */
    internalInitializeCachedBackgroundCanvases() {
        for (const key in this.cachedBackgroundCanvases) {
            // Background canvas
            const dims = globalConfig.tileSize;
            const dpi = this.backgroundCacheDPI;
            const [canvas, context] = makeOffscreenBuffer(dims * dpi, dims * dpi, {
                smooth: false,
                label: "map-cached-bg",
            });
            context.scale(dpi, dpi);
            context.fillStyle = THEME.map.background;
            context.fillRect(0, 0, dims, dims);
            const borderWidth = THEME.map.gridLineWidth;
            context.fillStyle = THEME.map["grid" + key[0].toUpperCase() + key.substring(1)] || "red";
            context.fillRect(0, 0, dims, borderWidth);
            context.fillRect(0, borderWidth, borderWidth, dims);
            context.fillRect(dims - borderWidth, borderWidth, borderWidth, dims - 2 * borderWidth);
            context.fillRect(borderWidth, dims - borderWidth, dims, borderWidth);
            this.cachedBackgroundCanvases[key] = canvas;
        }
    }
    /**
     * Draws the maps foreground
     */
    drawForeground(parameters: DrawParameters) {
        this.drawVisibleChunks(parameters, MapChunkView.prototype.drawForegroundDynamicLayer);
        this.drawVisibleChunks(parameters, MapChunkView.prototype.drawForegroundStaticLayer);
    }
    /**
     * Calls a given method on all given chunks
     */
    drawVisibleChunks(parameters: DrawParameters, method: function) {
        const cullRange = parameters.visibleRect.allScaled(1 / globalConfig.tileSize);
        const top = cullRange.top();
        const right = cullRange.right();
        const bottom = cullRange.bottom();
        const left = cullRange.left();
        const border = 0;
        const minY = top - border;
        const maxY = bottom + border;
        const minX = left - border;
        const maxX = right + border;
        const chunkStartX = Math.floor(minX / globalConfig.mapChunkSize);
        const chunkStartY = Math.floor(minY / globalConfig.mapChunkSize);
        const chunkEndX = Math.floor(maxX / globalConfig.mapChunkSize);
        const chunkEndY = Math.floor(maxY / globalConfig.mapChunkSize);
        // Render y from top down for proper blending
        for (let chunkX = chunkStartX; chunkX <= chunkEndX; ++chunkX) {
            for (let chunkY = chunkStartY; chunkY <= chunkEndY; ++chunkY) {
                const chunk = this.root.map.getChunk(chunkX, chunkY, true);
                method.call(chunk, parameters);
            }
        }
    }
    /**
     * Calls a given method on all given chunks
     */
    drawVisibleAggregates(parameters: DrawParameters, method: function) {
        const cullRange = parameters.visibleRect.allScaled(1 / globalConfig.tileSize);
        const top = cullRange.top();
        const right = cullRange.right();
        const bottom = cullRange.bottom();
        const left = cullRange.left();
        const border = 0;
        const minY = top - border;
        const maxY = bottom + border;
        const minX = left - border;
        const maxX = right + border;
        const aggregateTiles = globalConfig.chunkAggregateSize * globalConfig.mapChunkSize;
        const aggStartX = Math.floor(minX / aggregateTiles);
        const aggStartY = Math.floor(minY / aggregateTiles);
        const aggEndX = Math.floor(maxX / aggregateTiles);
        const aggEndY = Math.floor(maxY / aggregateTiles);
        // Render y from top down for proper blending
        for (let aggX = aggStartX; aggX <= aggEndX; ++aggX) {
            for (let aggY = aggStartY; aggY <= aggEndY; ++aggY) {
                const aggregate = this.root.map.getAggregate(aggX, aggY, true);
                method.call(aggregate, parameters);
            }
        }
    }
    /**
     * Draws the wires foreground
     */
    drawWiresForegroundLayer(parameters: DrawParameters) {
        this.drawVisibleChunks(parameters, MapChunkView.prototype.drawWiresForegroundLayer);
    }
    /**
     * Draws the map overlay
     */
    drawOverlay(parameters: DrawParameters) {
        this.drawVisibleAggregates(parameters, MapChunkAggregate.prototype.drawOverlay);
    }
    /**
     * Draws the map background
     */
    drawBackground(parameters: DrawParameters) {
        // Render tile grid
        if (!this.root.app.settings.getAllSettings().disableTileGrid || !this.root.gameMode.hasResources()) {
            const dpi = this.backgroundCacheDPI;
            parameters.context.scale(1 / dpi, 1 / dpi);
            let key = "regular";
            // Disabled rn because it can be really annoying
            // eslint-disable-next-line no-constant-condition
            if (this.root.hud.parts.buildingPlacer.currentMetaBuilding.get() && false) {
                key = "placing";
            }
            // @ts-ignore`
            if (this.cachedBackgroundCanvases[key]._contextLost) {
                freeCanvas(this.cachedBackgroundCanvases[key]);
                this.internalInitializeCachedBackgroundCanvases();
            }
            parameters.context.fillStyle = parameters.context.createPattern(this.cachedBackgroundCanvases[key], "repeat");
            parameters.context.fillRect(parameters.visibleRect.x * dpi, parameters.visibleRect.y * dpi, parameters.visibleRect.w * dpi, parameters.visibleRect.h * dpi);
            parameters.context.scale(dpi, dpi);
        }
        this.drawVisibleChunks(parameters, MapChunkView.prototype.drawBackgroundLayer);
    }
}
