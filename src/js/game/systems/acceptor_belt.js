import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { Rectangle } from "../../core/rectangle";
import { enumDirectionToAngle, enumInvertedDirections } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { BELT_ANIM_COUNT } from "./belt";

// nearly identical to systems/ejector_belt.js
export class AcceptorBeltSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemAcceptorComponent]);

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
        // SYNC with systems/belt.js:drawChunk!
        const speedMultiplier = Math.min(this.root.hubGoals.getBeltBaseSpeed(), 10);
        const animationIndex = Math.floor(
            ((this.root.time.realtimeNow() * speedMultiplier * BELT_ANIM_COUNT * 126) / 42) *
                globalConfig.itemSpacingOnBelts
        );

        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const acceptorComp = entity.components.ItemAcceptor;
            if (!acceptorComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            for (let i = 0; i < acceptorComp.slots.length; ++i) {
                // Extract underlay parameters
                const { pos, directions, beltLength } = acceptorComp.slots[i];

                // skips both missing and 0 belt lengths
                if (!beltLength) {
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

                for (let j = 0; j < directions.length; ++j) {
                    const direction = directions[j];

                    // Extract direction and angle
                    const worldDirection = staticComp.localDirectionToWorld(direction);
                    const angle = enumDirectionToAngle[enumInvertedDirections[worldDirection]];

                    const clipRect = new Rectangle(0, 1 - beltLength, 1, beltLength);

                    // Actually draw the sprite
                    const x = destX + globalConfig.halfTileSize;
                    const y = destY + globalConfig.halfTileSize;
                    const angleRadians = Math.radians(angle);

                    parameters.context.translate(x, y);
                    parameters.context.rotate(angleRadians);
                    this.underlayBeltSprites[animationIndex % BELT_ANIM_COUNT].drawCachedWithClipRect(
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
}
