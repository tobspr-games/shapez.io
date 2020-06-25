import { GameSystemWithFilter } from "../game_system_with_filter";
import { WiredPinsComponent } from "../components/wired_pins";
import { DrawParameters } from "../../core/draw_parameters";
import { Entity } from "../entity";
import { THEME } from "../theme";

export class WiredPinsSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [WiredPinsComponent]);
    }

    update() {
        // TODO
    }

    drawWiresLayer(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityPins.bind(this));
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityPins(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        const pinsComp = entity.components.WiredPins;

        const slots = pinsComp.slots;

        for (let i = 0; i < slots.length; ++i) {
            const slot = slots[i];
            const tile = staticComp.localTileToWorld(slot.pos);

            const worldPos = tile.toWorldSpaceCenterOfTile();

            parameters.context.fillStyle = THEME.map.wires.pins[slot.type];
            parameters.context.beginCircle(worldPos.x, worldPos.y, 5);
            parameters.context.fill();

            parameters.context.lineWidth = 2;
            parameters.context.fillStyle = "rgba(0, 0, 0, 0.1)";
            parameters.context.stroke();
        }
    }
}
