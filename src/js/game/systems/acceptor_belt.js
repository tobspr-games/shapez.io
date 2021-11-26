import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { Rectangle } from "../../core/rectangle";
import {
    enumDirection,
    enumDirectionToAngle,
    enumDirectionToVector,
    enumInvertedDirections,
    Vector,
} from "../../core/vector";
import { BeltPath } from "../belt_path";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { Entity } from "../entity";
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
     * Gets the adjacent entity that ejects to a tile
     * @param {Vector} toTile
     * @param {enumDirection} toDirection
     * @returns {Entity}
     */
    getSourceEntity(toTile, toDirection) {
        const toDirectionVector = enumDirectionToVector[toDirection];
        const tile = toTile.sub(toDirectionVector);

        const contents = this.root.map.getLayerContentXY(tile.x, tile.y, "regular");
        if (!contents) {
            return null;
        }

        const staticComp = contents.components.StaticMapEntity;

        // Check if its a belt, since then its simple
        const beltComp = contents.components.Belt;
        if (beltComp) {
            return staticComp.localDirectionToWorld(beltComp.direction) === toDirection ? contents : null;
        }

        // Check for an ejector
        const ejectorComp = contents.components.ItemEjector;
        if (ejectorComp) {
            // Check each slot to see if its connected
            for (let i = 0; i < ejectorComp.slots.length; ++i) {
                const slot = ejectorComp.slots[i];
                const slotTile = staticComp.localTileToWorld(slot.pos);

                // Step 1: Check if the tile matches
                if (!slotTile.equals(tile)) {
                    continue;
                }

                // Step 2: Check if the direction matches
                const slotDirection = staticComp.localDirectionToWorld(slot.direction);
                if (slotDirection === toDirection) {
                    return contents;
                }
            }
        }

        return null;
    }

    /**
     * Draws a given chunk
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     * @param {object} param0
     * @param {number} param0.animationIndex
     * @param {boolean} param0.simplifiedBelts
     * @param {BeltPath} param0.hoveredBeltPath
     */
    internalDrawChunk(parameters, chunk, { animationIndex, simplifiedBelts, hoveredBeltPath }) {
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
                    const worldDirection =
                        enumInvertedDirections[staticComp.localDirectionToWorld(direction)];
                    const worldDirectionVector = enumDirectionToVector[worldDirection];
                    const angle = enumDirectionToAngle[worldDirection];

                    // check if connected
                    const sourceEntity = this.getSourceEntity(transformedPos, worldDirection);
                    if (!sourceEntity) {
                        continue;
                    }

                    const sourceBeltComp = sourceEntity.components.Belt;
                    const sourceBeltPath = sourceBeltComp ? sourceBeltComp.assignedPath : null;

                    const clipRect = new Rectangle(0, 1 - beltLength, 1, beltLength);

                    // Actually draw the sprite
                    const x = destX + globalConfig.halfTileSize;
                    const y = destY + globalConfig.halfTileSize;
                    const angleRadians = Math.radians(angle);

                    parameters.context.translate(x, y);
                    parameters.context.rotate(angleRadians);
                    this.underlayBeltSprites[
                        !simplifiedBelts || (sourceBeltPath && sourceBeltPath === hoveredBeltPath)
                            ? animationIndex % BELT_ANIM_COUNT
                            : 0
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
}
