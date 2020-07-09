import { GameSystem } from "../game_system";
import { DrawParameters } from "../../core/draw_parameters";
import { globalConfig } from "../../core/config";
import { MapChunkView } from "../map_chunk_view";
import { Loader } from "../../core/loader";
import { enumDirection } from "../../core/vector";
import { enumLayer } from "../root";

export class StaticMapEntitySystem extends GameSystem {
    constructor(root) {
        super(root);

        this.beltOverviewSprites = {
            [enumDirection.top]: Loader.getSprite("sprites/map_overview/belt_forward.png"),
            [enumDirection.right]: Loader.getSprite("sprites/map_overview/belt_right.png"),
            [enumDirection.left]: Loader.getSprite("sprites/map_overview/belt_left.png"),
        };
    }

    /**
     * Draws the static entities
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        if (G_IS_DEV && globalConfig.debug.doNotRenderStatics) {
            return;
        }

        const drawOutlinesOnly = parameters.zoomLevel < globalConfig.mapChunkOverviewMinZoom;

        const drawnUids = new Set();

        const contents = chunk.contents;
        for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
            for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                const entity = contents[x][y];

                if (entity) {
                    if (drawnUids.has(entity.uid)) {
                        continue;
                    }
                    drawnUids.add(entity.uid);
                    const staticComp = entity.components.StaticMapEntity;
                    if (drawOutlinesOnly) {
                        const rect = staticComp.getTileSpaceBounds();
                        parameters.context.fillStyle = staticComp.silhouetteColor || "#aaa";
                        const beltComp = entity.components.Belt;
                        if (beltComp) {
                            const sprite = this.beltOverviewSprites[beltComp.direction];
                            staticComp.drawSpriteOnFullEntityBounds(parameters, sprite, 0, false);
                        } else {
                            parameters.context.fillRect(
                                rect.x * globalConfig.tileSize,
                                rect.y * globalConfig.tileSize,
                                rect.w * globalConfig.tileSize,
                                rect.h * globalConfig.tileSize
                            );
                        }
                    } else {
                        const spriteKey = staticComp.spriteKey;
                        if (spriteKey) {
                            const sprite = Loader.getSprite(spriteKey);
                            staticComp.drawSpriteOnFullEntityBounds(parameters, sprite, 2, false);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draws the static wire entities
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawWiresChunk(parameters, chunk) {
        if (G_IS_DEV && globalConfig.debug.doNotRenderStatics) {
            return;
        }

        const drawnUids = new Set();
        const contents = chunk.wireContents;
        for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
            for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                const entity = contents[x][y];
                if (entity) {
                    if (drawnUids.has(entity.uid)) {
                        continue;
                    }
                    drawnUids.add(entity.uid);
                    const staticComp = entity.components.StaticMapEntity;

                    const spriteKey = staticComp.spriteKey;
                    if (spriteKey) {
                        const sprite = Loader.getSprite(spriteKey);
                        staticComp.drawSpriteOnFullEntityBounds(parameters, sprite, 2, false);
                    }
                }
            }
        }
    }
}
