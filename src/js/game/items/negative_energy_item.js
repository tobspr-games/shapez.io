import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { types } from "../../savegame/serialization";
import { BaseItem, enumItemType } from "../base_item";

export class NegativeEnergyItem extends BaseItem {
    static getId() {
        return "negative_energy";
    }

    static getSchema() {
        return types.uint;
    }

    serialize() {
        return 0;
    }

    deserialize(data) {}

    getItemType() {
        return enumItemType.negativeEnergy;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} size
     * @param {DrawParameters} parameters
     */
    draw(x, y, parameters, size = 12) {
        const sprite = Loader.getSprite("sprites/wires/negative_energy.png");
        sprite.drawCachedCentered(parameters, x, y, size * 1.5);
    }
}

export const NEGATIVE_ENERGY_ITEM_SINGLETON = new NegativeEnergyItem();
