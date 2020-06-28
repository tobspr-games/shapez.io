import { GameSystemWithFilter } from "../game_system_with_filter";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";
import { DrawParameters } from "../../core/draw_parameters";
import { Entity } from "../entity";
import { THEME } from "../theme";
import { Loader } from "../../core/loader";
import { globalConfig } from "../../core/config";

export class WiredPinsSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [WiredPinsComponent]);

        this.pinSprites = {
            [enumPinSlotType.energyEjector]: [Loader.getSprite("sprites/wires/pin-energy-on.png")],
        };
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

            this.pinSprites[slot.type][0].drawCachedCentered(
                parameters,
                worldPos.x,
                worldPos.y,
                globalConfig.tileSize
            );
        }
    }
}
