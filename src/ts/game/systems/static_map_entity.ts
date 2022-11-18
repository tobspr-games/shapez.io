import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { GameSystem } from "../game_system";
import { MapChunkView } from "../map_chunk_view";
export class StaticMapEntitySystem extends GameSystem {
    public drawnUids: Set<number> = new Set();

    constructor(root) {
        super(root);
        this.root.signals.gameFrameStarted.add(this.clearUidList, this);
    }
    /**
     * Clears the uid list when a new frame started
     */
    clearUidList(): any {
        this.drawnUids.clear();
    }
    /**
     * Draws the static entities
     */
    drawChunk(parameters: DrawParameters, chunk: MapChunkView): any {
        if (G_IS_DEV && globalConfig.debug.doNotRenderStatics) {
            return;
        }
        const contents: any = chunk.containedEntitiesByLayer.regular;
        for (let i: any = 0; i < contents.length; ++i) {
            const entity: any = contents[i];
            const staticComp: any = entity.components.StaticMapEntity;
            const sprite: any = staticComp.getSprite();
            if (sprite) {
                // Avoid drawing an entity twice which has been drawn for
                // another chunk already
                if (this.drawnUids.has(entity.uid)) {
                    continue;
                }
                this.drawnUids.add(entity.uid);
                staticComp.drawSpriteOnBoundsClipped(parameters, sprite, 2);
            }
        }
    }
    /**
     * Draws the static wire entities
     */
    drawWiresChunk(parameters: DrawParameters, chunk: MapChunkView): any {
        if (G_IS_DEV && globalConfig.debug.doNotRenderStatics) {
            return;
        }
        const drawnUids: any = new Set();
        const contents: any = chunk.wireContents;
        for (let y: any = 0; y < globalConfig.mapChunkSize; ++y) {
            for (let x: any = 0; x < globalConfig.mapChunkSize; ++x) {
                const entity: any = contents[x][y];
                if (entity) {
                    if (drawnUids.has(entity.uid)) {
                        continue;
                    }
                    drawnUids.add(entity.uid);
                    const staticComp: any = entity.components.StaticMapEntity;
                    const sprite: any = staticComp.getSprite();
                    if (sprite) {
                        staticComp.drawSpriteOnBoundsClipped(parameters, sprite, 2);
                    }
                }
            }
        }
    }
}
