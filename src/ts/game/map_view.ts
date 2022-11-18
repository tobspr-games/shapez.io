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
    cleanup(): any {
        for (const key: any in this.cachedBackgroundCanvases) {
            freeCanvas(this.cachedBackgroundCanvases[key]);
            this.cachedBackgroundCanvases[key] = null;
        }
    }
    /**
     * Called when an entity was added, removed or changed
     */
    onEntityChanged(entity: Entity): any {
        const staticComp: any = entity.components.StaticMapEntity;
        if (staticComp) {
            const rect: any = staticComp.getTileSpaceBounds();
            for (let x: any = rect.x; x <= rect.right(); ++x) {
                for (let y: any = rect.y; y <= rect.bottom(); ++y) {
                    this.root.map.getOrCreateChunkAtTile(x, y).markDirty();
                }
            }
        }
    }
    /**
     * Draws all static entities like buildings etc.
     */
    drawStaticEntityDebugOverlays(drawParameters: DrawParameters): any {
        if (G_IS_DEV && (globalConfig.debug.showAcceptorEjectors || globalConfig.debug.showEntityBounds)) {
            const cullRange: any = drawParameters.visibleRect.toTileCullRectangle();
            const top: any = cullRange.top();
            const right: any = cullRange.right();
            const bottom: any = cullRange.bottom();
            const left: any = cullRange.left();
            const border: any = 1;
            const minY: any = top - border;
            const maxY: any = bottom + border;
            const minX: any = left - border;
            const maxX: any = right + border - 1;
            // Render y from top down for proper blending
            for (let y: any = minY; y <= maxY; ++y) {
                for (let x: any = minX; x <= maxX; ++x) {
                    // const content = this.tiles[x][y];
                    const chunk: any = this.getChunkAtTileOrNull(x, y);
                    if (!chunk) {
                        continue;
                    }
                    const content: any = chunk.getTileContentFromWorldCoords(x, y);
                    if (content) {
                        let isBorder: any = x <= left - 1 || x >= right + 1 || y <= top - 1 || y >= bottom + 1;
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
    internalInitializeCachedBackgroundCanvases(): any {
        for (const key: any in this.cachedBackgroundCanvases) {
            // Background canvas
            const dims: any = globalConfig.tileSize;
            const dpi: any = this.backgroundCacheDPI;
            const [canvas, context]: any = makeOffscreenBuffer(dims * dpi, dims * dpi, {
                smooth: false,
                label: "map-cached-bg",
            });
            context.scale(dpi, dpi);
            context.fillStyle = THEME.map.background;
            context.fillRect(0, 0, dims, dims);
            const borderWidth: any = THEME.map.gridLineWidth;
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
    drawForeground(parameters: DrawParameters): any {
        this.drawVisibleChunks(parameters, MapChunkView.prototype.drawForegroundDynamicLayer);
        this.drawVisibleChunks(parameters, MapChunkView.prototype.drawForegroundStaticLayer);
    }
    /**
     * Calls a given method on all given chunks
     */
    drawVisibleChunks(parameters: DrawParameters, method: function): any {
        const cullRange: any = parameters.visibleRect.allScaled(1 / globalConfig.tileSize);
        const top: any = cullRange.top();
        const right: any = cullRange.right();
        const bottom: any = cullRange.bottom();
        const left: any = cullRange.left();
        const border: any = 0;
        const minY: any = top - border;
        const maxY: any = bottom + border;
        const minX: any = left - border;
        const maxX: any = right + border;
        const chunkStartX: any = Math.floor(minX / globalConfig.mapChunkSize);
        const chunkStartY: any = Math.floor(minY / globalConfig.mapChunkSize);
        const chunkEndX: any = Math.floor(maxX / globalConfig.mapChunkSize);
        const chunkEndY: any = Math.floor(maxY / globalConfig.mapChunkSize);
        // Render y from top down for proper blending
        for (let chunkX: any = chunkStartX; chunkX <= chunkEndX; ++chunkX) {
            for (let chunkY: any = chunkStartY; chunkY <= chunkEndY; ++chunkY) {
                const chunk: any = this.root.map.getChunk(chunkX, chunkY, true);
                method.call(chunk, parameters);
            }
        }
    }
    /**
     * Calls a given method on all given chunks
     */
    drawVisibleAggregates(parameters: DrawParameters, method: function): any {
        const cullRange: any = parameters.visibleRect.allScaled(1 / globalConfig.tileSize);
        const top: any = cullRange.top();
        const right: any = cullRange.right();
        const bottom: any = cullRange.bottom();
        const left: any = cullRange.left();
        const border: any = 0;
        const minY: any = top - border;
        const maxY: any = bottom + border;
        const minX: any = left - border;
        const maxX: any = right + border;
        const aggregateTiles: any = globalConfig.chunkAggregateSize * globalConfig.mapChunkSize;
        const aggStartX: any = Math.floor(minX / aggregateTiles);
        const aggStartY: any = Math.floor(minY / aggregateTiles);
        const aggEndX: any = Math.floor(maxX / aggregateTiles);
        const aggEndY: any = Math.floor(maxY / aggregateTiles);
        // Render y from top down for proper blending
        for (let aggX: any = aggStartX; aggX <= aggEndX; ++aggX) {
            for (let aggY: any = aggStartY; aggY <= aggEndY; ++aggY) {
                const aggregate: any = this.root.map.getAggregate(aggX, aggY, true);
                method.call(aggregate, parameters);
            }
        }
    }
    /**
     * Draws the wires foreground
     */
    drawWiresForegroundLayer(parameters: DrawParameters): any {
        this.drawVisibleChunks(parameters, MapChunkView.prototype.drawWiresForegroundLayer);
    }
    /**
     * Draws the map overlay
     */
    drawOverlay(parameters: DrawParameters): any {
        this.drawVisibleAggregates(parameters, MapChunkAggregate.prototype.drawOverlay);
    }
    /**
     * Draws the map background
     */
    drawBackground(parameters: DrawParameters): any {
        // Render tile grid
        if (!this.root.app.settings.getAllSettings().disableTileGrid || !this.root.gameMode.hasResources()) {
            const dpi: any = this.backgroundCacheDPI;
            parameters.context.scale(1 / dpi, 1 / dpi);
            let key: any = "regular";
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
