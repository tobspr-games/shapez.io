import { GameSystemWithFilter } from "../game_system_with_filter";
import { BufferComponent } from "../components/item_buffer";
import { DrawParameters } from "../../core/draw_parameters";
import { Entity } from "../entity";
import { formatBigNumber } from "../../core/utils";
import { Loader } from "../../core/loader";

export class BufferSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BufferComponent]);

        this.bufferSprite = Loader.getSprite("sprites/buildings/buffer.png");
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntity.bind(this));
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntity(parameters, entity) {
        const context = parameters.context;
        const staticComp = entity.components.StaticMapEntity;
        const bufferContents = entity.components.Buffer;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        const pos = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

        // Background
        staticComp.drawSpriteOnFullEntityBounds(parameters, this.bufferSprite, 2.2);

        bufferContents.definition.draw(pos.x, pos.y - 5, parameters, 20);

        const textOffsetX = 2;
        const textOffsetY = -6;

        context.font = "bold 10px GameFont";
        context.fillStyle = "#64666e";
        context.textAlign = "left";
        context.fillText("" + formatBigNumber(bufferContents.itemCount), pos.x + textOffsetX, pos.y + textOffsetY);

        context.font = "10px GameFont";
        context.fillStyle = "#a4a6b0";
        context.fillText(
            "/ " + formatBigNumber(bufferContents.storageLimit),
            pos.x + textOffsetX,
            pos.y + textOffsetY + 13
        );

        context.textAlign = "left";
    }
}
