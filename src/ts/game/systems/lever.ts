import { Loader } from "../../core/loader";
import { LeverComponent } from "../components/lever";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON } from "../items/boolean_item";
import { MapChunkView } from "../map_chunk_view";
export class LeverSystem extends GameSystemWithFilter {
    public spriteOn = Loader.getSprite("sprites/wires/lever_on.png");
    public spriteOff = Loader.getSprite("sprites/buildings/lever.png");

    constructor(root) {
        super(root, [LeverComponent]);
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
     */
    drawChunk(parameters: import("../../core/draw_utils").DrawParameters, chunk: MapChunkView) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const leverComp = entity.components.Lever;
            if (leverComp) {
                const sprite = leverComp.toggled ? this.spriteOn : this.spriteOff;
                entity.components.StaticMapEntity.drawSpriteOnBoundsClipped(parameters, sprite);
            }
        }
    }
}
