import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";

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

    /** @returns {"boolean"} **/
    getItemType() {
        return "boolean";
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
     * @param {number} size
     * @param {DrawParameters} parameters
     */
    draw(x, y, parameters, size = 12) {
        let sprite;
        if (this.value) {
            sprite = Loader.getSprite("sprites/wires/boolean_true.png");
        } else {
            sprite = Loader.getSprite("sprites/wires/boolean_false.png");
        }
        sprite.drawCachedCentered(parameters, x, y, size * 1.5);
    }
}

export const BOOL_FALSE_SINGLETON = new BooleanItem(0);
export const BOOL_TRUE_SINGLETON = new BooleanItem(1);
