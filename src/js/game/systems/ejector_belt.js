import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { Rectangle } from "../../core/rectangle";
import { enumDirectionToAngle } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { BELT_ANIM_COUNT } from "./belt";

// nearly identical to systems/acceptor_belt.js
export class EjectorBeltSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemEjectorComponent]);

        this.underlayBeltSprites = [];

        for (let i = 0; i < BELT_ANIM_COUNT; ++i) {
            this.underlayBeltSprites.push(Loader.getSprite("sprites/belt/built/forward_" + i + ".png"));
        }
    }

    /**
     * Draws a given chunk
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     * @param {object} param0
     * @param {number} param0.animationIndex
     * @param {boolean} param0.simplifiedBelts
     */
    internalDrawChunk(parameters, chunk, { animationIndex, simplifiedBelts }) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const ejectorComp = entity.components.ItemEjector;
            if (!ejectorComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            for (let i = 0; i < ejectorComp.slots.length; ++i) {
                // Extract underlay parameters
                const { pos, direction, beltLength, cachedTargetEntity } = ejectorComp.slots[i];

                // skips both missing and 0 belt lengths
                if (!beltLength) {
                    continue;
                }

                // check if connected
                if (!cachedTargetEntity) {
                    continue;
                }

                const transformedPos = staticComp.localTileToWorld(pos);
                const destX = transformedPos.x * globalConfig.tileSize;
                const destY = transformedPos.y * globalConfig.tileSize;

                // Culling, Part 1: Check if the chunk contains the tile
                if (!chunk.tileSpaceRectangle.containsPoint(transformedPos.x, transformedPos.y)) {
                    continue;
                }

                // Culling, Part 2: Check if the overlay is visible
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

                // Extract direction and angle
                const worldDirection = staticComp.localDirectionToWorld(direction);
                const angle = enumDirectionToAngle[worldDirection];

                const clipRect = new Rectangle(0, 0, 1, beltLength);

                // Actually draw the sprite
                const x = destX + globalConfig.halfTileSize;
                const y = destY + globalConfig.halfTileSize;
                const angleRadians = Math.radians(angle);

                parameters.context.translate(x, y);
                parameters.context.rotate(angleRadians);
                this.underlayBeltSprites[
                    !simplifiedBelts ? animationIndex % BELT_ANIM_COUNT : 0
                ].drawCachedWithClipRect(
                    parameters,
                    -globalConfig.halfTileSize,
                    -globalConfig.halfTileSize,
                    globalConfig.tileSize,
                    globalConfig.tileSize,
                    clipRect
                );
                parameters.context.rotate(-angleRadians);
                parameters.context.translate(-x, -y);
            }
        }
    }
}
