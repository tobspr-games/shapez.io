import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { Rectangle } from "../../core/rectangle";
import { FULL_CLIP_RECT } from "../../core/sprites";
import { enumDirectionToAngle } from "../../core/vector";
import { enumClippedBeltUnderlayType } from "../components/belt_underlays";
import { ItemEjectorComponent } from "../components/item_ejector";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { BELT_ANIM_COUNT } from "./belt";

/**
 * Mapping from underlay type to clip rect
 * @type {Object<enumClippedBeltUnderlayType, Rectangle>}
 */
const enumUnderlayTypeToClipRect = {
    [enumClippedBeltUnderlayType.none]: null,
    [enumClippedBeltUnderlayType.full]: FULL_CLIP_RECT,
    [enumClippedBeltUnderlayType.topOnly]: new Rectangle(0, 0, 1, 0.5),
    [enumClippedBeltUnderlayType.bottomOnly]: new Rectangle(0, 0.5, 1, 0.5),
};

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
     */
    drawChunk(parameters, chunk) {
        // Limit speed to avoid belts going backwards
        const speedMultiplier = Math.min(this.root.hubGoals.getBeltBaseSpeed(), 10);
        // SYNC with systems/belt.js:drawChunk!
        const animationIndex = Math.floor(
            ((this.root.time.realtimeNow() * speedMultiplier * BELT_ANIM_COUNT * 126) / 42) *
                globalConfig.itemSpacingOnBelts
        );

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
                const { pos, direction } = ejectorComp.slots[i];
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

                const underlayType = enumClippedBeltUnderlayType.topOnly;
                const clipRect = enumUnderlayTypeToClipRect[underlayType];
                if (!clipRect) {
                    // Empty
                    continue;
                }

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
