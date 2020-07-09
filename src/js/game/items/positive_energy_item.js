import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { types } from "../../savegame/serialization";
import { BaseItem, enumItemType } from "../base_item";

export class PositiveEnergyItem extends BaseItem {
    static getId() {
        return "positive_energy";
    }

    static getSchema() {
        return types.uint;
    }

    serialize() {
        return 0;
    }

    deserialize(data) {}

    getItemType() {
        return enumItemType.positiveEnergy;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} size
     * @param {DrawParameters} parameters
     */
    draw(x, y, parameters, size = 12) {
        const sprite = Loader.getSprite("sprites/wires/positive_energy.png");
        sprite.drawCachedCentered(parameters, x, y, size * 1.5);
    }
}

export const POSITIVE_ENERGY_ITEM_SINGLETON = new PositiveEnergyItem();
