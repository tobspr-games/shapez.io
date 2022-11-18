import { globalConfig } from "../core/config";
import { DrawParameters } from "../core/draw_parameters";
import { getBuildingDataFromCode } from "./building_codes";
import { Entity } from "./entity";
import { MapChunk } from "./map_chunk";
import { GameRoot } from "./root";
import { THEME } from "./theme";
export const CHUNK_OVERLAY_RES = 3;
export const MOD_CHUNK_DRAW_HOOKS = {
    backgroundLayerBefore: [],
    backgroundLayerAfter: [],
    foregroundDynamicBefore: [],
    foregroundDynamicAfter: [],
    staticBefore: [],
    staticAfter: [],
};
export class MapChunkView extends MapChunk {
    public renderIteration = 0;

        constructor(root, x, y) {
        super(root, x, y);
        this.markDirty();
    }
    /**
     * Marks this chunk as dirty, rerendering all caches
     */
    markDirty() {
        ++this.renderIteration;
        this.renderKey = this.x + "/" + this.y + "@" + this.renderIteration;
        this.root.map.getAggregateForChunk(this.x, this.y, true).markDirty(this.x, this.y);
    }
    /**
     * Draws the background layer
     */
    drawBackgroundLayer(parameters: DrawParameters) {
        const systems = this.root.systemMgr.systems;
        MOD_CHUNK_DRAW_HOOKS.backgroundLayerBefore.forEach(systemId => systems[systemId].drawChunk(parameters, this));
        if (systems.zone) {
            systems.zone.drawChunk(parameters, this);
        }
        if (this.root.gameMode.hasResources()) {
            systems.mapResources.drawChunk(parameters, this);
        }
        systems.beltUnderlays.drawChunk(parameters, this);
        systems.belt.drawChunk(parameters, this);
        MOD_CHUNK_DRAW_HOOKS.backgroundLayerAfter.forEach(systemId => systems[systemId].drawChunk(parameters, this));
    }
    /**
     * Draws the dynamic foreground layer
     */
    drawForegroundDynamicLayer(parameters: DrawParameters) {
        const systems = this.root.systemMgr.systems;
        MOD_CHUNK_DRAW_HOOKS.foregroundDynamicBefore.forEach(systemId => systems[systemId].drawChunk(parameters, this));
        systems.itemEjector.drawChunk(parameters, this);
        systems.itemAcceptor.drawChunk(parameters, this);
        systems.miner.drawChunk(parameters, this);
        MOD_CHUNK_DRAW_HOOKS.foregroundDynamicAfter.forEach(systemId => systems[systemId].drawChunk(parameters, this));
    }
    /**
     * Draws the static foreground layer
     */
    drawForegroundStaticLayer(parameters: DrawParameters) {
        const systems = this.root.systemMgr.systems;
        MOD_CHUNK_DRAW_HOOKS.staticBefore.forEach(systemId => systems[systemId].drawChunk(parameters, this));
        systems.staticMapEntities.drawChunk(parameters, this);
        systems.lever.drawChunk(parameters, this);
        systems.display.drawChunk(parameters, this);
        systems.storage.drawChunk(parameters, this);
        systems.constantProducer.drawChunk(parameters, this);
        systems.goalAcceptor.drawChunk(parameters, this);
        systems.itemProcessorOverlays.drawChunk(parameters, this);
        MOD_CHUNK_DRAW_HOOKS.staticAfter.forEach(systemId => systems[systemId].drawChunk(parameters, this));
    }
        drawOverlayPatches(parameters: DrawParameters, xoffs: number, yoffs: number, diameter: number) {
        for (let i = 0; i < this.patches.length; ++i) {
            const patch = this.patches[i];
            if (patch.item.getItemType() === "shape") {
                const destX = xoffs + patch.pos.x * globalConfig.tileSize;
                const destY = yoffs + patch.pos.y * globalConfig.tileSize;
                patch.item.drawItemCenteredClipped(destX, destY, parameters, diameter);
            }
        }
    }
        generateOverlayBuffer(context: CanvasRenderingContext2D, w: number, h: number, xoffs: number=, yoffs: number=) {
        context.fillStyle =
            this.containedEntities.length > 0
                ? THEME.map.chunkOverview.filled
                : THEME.map.chunkOverview.empty;
        context.fillRect(xoffs, yoffs, w, h);
        if (this.root.app.settings.getAllSettings().displayChunkBorders) {
            context.fillStyle = THEME.map.chunkBorders;
            context.fillRect(xoffs, yoffs, w, 1);
            context.fillRect(xoffs, yoffs + 1, 1, h);
        }
        for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
            const lowerArray = this.lowerLayer[x];
            const upperArray = this.contents[x];
            for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                const upperContent = upperArray[y];
                if (upperContent) {
                    const staticComp = upperContent.components.StaticMapEntity;
                    const data = getBuildingDataFromCode(staticComp.code);
                    const metaBuilding = data.metaInstance;
                    const overlayMatrix = metaBuilding.getSpecialOverlayRenderMatrix(staticComp.rotation, data.rotationVariant, data.variant, upperContent);
                    if (overlayMatrix) {
                        // Draw lower content first since it "shines" through
                        const lowerContent = lowerArray[y];
                        if (lowerContent) {
                            context.fillStyle = lowerContent.getBackgroundColorAsResource();
                            context.fillRect(xoffs + x * CHUNK_OVERLAY_RES, yoffs + y * CHUNK_OVERLAY_RES, CHUNK_OVERLAY_RES, CHUNK_OVERLAY_RES);
                        }
                        context.fillStyle = metaBuilding.getSilhouetteColor(data.variant, data.rotationVariant);
                        for (let dx = 0; dx < 3; ++dx) {
                            for (let dy = 0; dy < 3; ++dy) {
                                const isFilled = overlayMatrix[dx + dy * 3];
                                if (isFilled) {
                                    context.fillRect(xoffs + x * CHUNK_OVERLAY_RES + dx, yoffs + y * CHUNK_OVERLAY_RES + dy, 1, 1);
                                }
                            }
                        }
                        continue;
                    }
                    else {
                        context.fillStyle = metaBuilding.getSilhouetteColor(data.variant, data.rotationVariant);
                        context.fillRect(xoffs + x * CHUNK_OVERLAY_RES, yoffs + y * CHUNK_OVERLAY_RES, CHUNK_OVERLAY_RES, CHUNK_OVERLAY_RES);
                        continue;
                    }
                }
                const lowerContent = lowerArray[y];
                if (lowerContent) {
                    context.fillStyle = lowerContent.getBackgroundColorAsResource();
                    context.fillRect(xoffs + x * CHUNK_OVERLAY_RES, yoffs + y * CHUNK_OVERLAY_RES, CHUNK_OVERLAY_RES, CHUNK_OVERLAY_RES);
                }
            }
        }
        if (this.root.currentLayer === "wires") {
            // Draw wires overlay
            context.fillStyle = THEME.map.wires.overlayColor;
            context.fillRect(xoffs, yoffs, w, h);
            for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                const wiresArray = this.wireContents[x];
                for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                    const content = wiresArray[y];
                    if (!content) {
                        continue;
                    }
                    MapChunkView.drawSingleWiresOverviewTile({
                        context,
                        x: xoffs + x * CHUNK_OVERLAY_RES,
                        y: yoffs + y * CHUNK_OVERLAY_RES,
                        entity: content,
                        tileSizePixels: CHUNK_OVERLAY_RES,
                    });
                }
            }
        }
    }
        static drawSingleWiresOverviewTile({ context, x, y, entity, tileSizePixels, overrideColor = null }: {
        context: CanvasRenderingContext2D;
        x: number;
        y: number;
        entity: Entity;
        tileSizePixels: number;
        overrideColor: string=;
    }) {
        const staticComp = entity.components.StaticMapEntity;
        const data = getBuildingDataFromCode(staticComp.code);
        const metaBuilding = data.metaInstance;
        const overlayMatrix = metaBuilding.getSpecialOverlayRenderMatrix(staticComp.rotation, data.rotationVariant, data.variant, entity);
        context.fillStyle =
            overrideColor || metaBuilding.getSilhouetteColor(data.variant, data.rotationVariant);
        if (overlayMatrix) {
            for (let dx = 0; dx < 3; ++dx) {
                for (let dy = 0; dy < 3; ++dy) {
                    const isFilled = overlayMatrix[dx + dy * 3];
                    if (isFilled) {
                        context.fillRect(x + (dx * tileSizePixels) / CHUNK_OVERLAY_RES, y + (dy * tileSizePixels) / CHUNK_OVERLAY_RES, tileSizePixels / CHUNK_OVERLAY_RES, tileSizePixels / CHUNK_OVERLAY_RES);
                    }
                }
            }
        }
        else {
            context.fillRect(x, y, tileSizePixels, tileSizePixels);
        }
    }
    /**
     * Draws the wires layer
     */
    drawWiresForegroundLayer(parameters: DrawParameters) {
        const systems = this.root.systemMgr.systems;
        systems.wire.drawChunk(parameters, this);
        systems.staticMapEntities.drawWiresChunk(parameters, this);
        systems.wiredPins.drawChunk(parameters, this);
    }
}
