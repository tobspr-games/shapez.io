import { GameSystemWithFilter } from "../game_system_with_filter";
import { LeverComponent } from "../components/lever";
import { BOOL_TRUE_SINGLETON, BOOL_FALSE_SINGLETON } from "../items/boolean_item";
import { MapChunkView } from "../map_chunk_view";
import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";

export class LeverSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [LeverComponent]);

        this.spriteOn = Loader.getSprite("sprites/wires/lever_on.png");
        this.spriteOff = Loader.getSprite("sprites/buildings/lever.png");
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const leverComp = entity.components.Lever;
            const pinsComp = entity.components.WiredPins;

            // Simply sync the status to the first slot
            pinsComp.slots[0].value = leverComp.toggled ? BOOL_TRUE_SINGLETON : BOOL_FALSE_SINGLETON;
        }
    }

    /**
     * Draws a given chunk
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            if (entity && entity.components.Lever) {
                const sprite = entity.components.Lever.toggled ? this.spriteOn : this.spriteOff;
                const origin = entity.components.StaticMapEntity.origin;
                sprite.drawCached(
                    parameters,
                    origin.x * globalConfig.tileSize,
                    origin.y * globalConfig.tileSize,
                    globalConfig.tileSize,
                    globalConfig.tileSize
                );
            }
        }
    }
}
