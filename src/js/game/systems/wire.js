import { GameSystemWithFilter } from "../game_system_with_filter";
import { WireComponent, enumWireType } from "../components/wire";
import { MapChunkView } from "../map_chunk_view";
import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";

export class WireSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [WireComponent]);

        this.wireSprites = {
            [enumWireType.regular]: Loader.getSprite("sprites/buildings/wire.png"),
            [enumWireType.turn]: Loader.getSprite("sprites/buildings/wire-turn.png"),
            [enumWireType.split]: Loader.getSprite("sprites/buildings/wire-split.png"),
        };
    }

    /**
     * Draws a given chunk
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.wireContents;
        for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
            for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                const entity = contents[x][y];
                if (entity && entity.components.Wire) {
                    const wireType = entity.components.Wire.type;
                    const sprite = this.wireSprites[wireType];
                    entity.components.StaticMapEntity.drawSpriteOnFullEntityBounds(parameters, sprite, 0);
                }
            }
        }
    }
}
