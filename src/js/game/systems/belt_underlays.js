import { globalConfig } from "../../core/config";
import { drawRotatedSprite } from "../../core/draw_utils";
import { Loader } from "../../core/loader";
import { enumDirectionToAngle } from "../../core/vector";
import { BeltUnderlaysComponent } from "../components/belt_underlays";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BELT_ANIM_COUNT } from "./belt";
import { MapChunkView } from "../map_chunk_view";
import { DrawParameters } from "../../core/draw_parameters";

export class BeltUnderlaysSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BeltUnderlaysComponent]);

        this.underlayBeltSprites = [];

        for (let i = 0; i < BELT_ANIM_COUNT; ++i) {
            this.underlayBeltSprites.push(Loader.getSprite("sprites/belt/built/forward_" + i + ".png"));
        }
    }

    /**
     * Draws a given chunk
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        // Limit speed to avoid belts going backwards
        const speedMultiplier = Math.min(this.root.hubGoals.getBeltBaseSpeed(), 10);

        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const underlayComp = entity.components.BeltUnderlays;
            if (!underlayComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            const underlays = underlayComp.underlays;
            for (let i = 0; i < underlays.length; ++i) {
                const { pos, direction } = underlays[i];
                const transformedPos = staticComp.localTileToWorld(pos);

                // Culling
                if (!chunk.tileSpaceRectangle.containsPoint(transformedPos.x, transformedPos.y)) {
                    continue;
                }

                const destX = transformedPos.x * globalConfig.tileSize;
                const destY = transformedPos.y * globalConfig.tileSize;

                // Culling, #2
                if (
                    !parameters.visibleRect.containsRect4Params(
                        destX,
                        destY,
                        globalConfig.tileSize,
                        globalConfig.tileSize
                    )
                ) {
                    continue;
                }

                const angle = enumDirectionToAngle[staticComp.localDirectionToWorld(direction)];

                // SYNC with systems/belt.js:drawSingleEntity!
                const animationIndex = Math.floor(
                    ((this.root.time.realtimeNow() * speedMultiplier * BELT_ANIM_COUNT * 126) / 42) *
                        globalConfig.itemSpacingOnBelts
                );

                drawRotatedSprite({
                    parameters,
                    sprite: this.underlayBeltSprites[animationIndex % this.underlayBeltSprites.length],
                    x: destX + globalConfig.halfTileSize,
                    y: destY + globalConfig.halfTileSize,
                    angle: Math.radians(angle),
                    size: globalConfig.tileSize,
                });
            }
        }
    }
}
