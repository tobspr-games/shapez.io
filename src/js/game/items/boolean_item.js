import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { types } from "../../savegame/serialization";
import { BaseItem, enumItemType } from "../base_item";

export class BooleanItem extends BaseItem {
    static getId() {
        return "boolean_item";
    }

    static getSchema() {
        return types.uint;
    }

    serialize() {
        return this.value;
    }

    deserialize(data) {
        this.value = data;
    }

    getItemType() {
        return enumItemType.boolean;
    }

    /**
     * @param {number} value
     */
    constructor(value) {
        super();
        this.value = value ? 1 : 0;
    }

    /**
     * @param {BaseItem} other
     */
    equalsImpl(other) {
        return this.value === /** @type {BooleanItem} */ (other).value;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} diameter
     * @param {DrawParameters} parameters
     */
    drawCentered(x, y, parameters, diameter = 12) {
        let sprite;
        if (this.value) {
            sprite = Loader.getSprite("sprites/wires/boolean_true.png");
        } else {
            sprite = Loader.getSprite("sprites/wires/boolean_false.png");
        }
        sprite.drawCachedCentered(parameters, x, y, diameter);
    }
}

export const BOOL_FALSE_SINGLETON = new BooleanItem(0);
export const BOOL_TRUE_SINGLETON = new BooleanItem(1);
