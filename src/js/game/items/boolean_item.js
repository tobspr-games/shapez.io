import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { globalConfig } from "../../core/config";

/** @typedef {0 | 1} Bit **/

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
     * @param {Bit} value
     */
    constructor(value) {
        super();
        this.value = value;
    }

    /**
     * @param {BooleanItem} other
     */
    equalsImpl(other) {
        return this.value === other.value;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} diameter
     * @param {DrawParameters} parameters
     */
    drawItemCenteredImpl(x, y, parameters, diameter = globalConfig.defaultItemDiameter) {
        const value = Boolean(this.value).toString();
        const sprite = Loader.getSprite(`sprites/wires/boolean_${value}.png`);
        sprite.drawCachedCentered(parameters, x, y, diameter);
    }
}

export const BOOL_FALSE_SINGLETON = new BooleanItem(0);
export const BOOL_TRUE_SINGLETON = new BooleanItem(1);

/**
 * @param {unknown} item
 * @returns {item is BooleanItem}
 **/
export const isBooleanItem = item => {
    return item instanceof BooleanItem;
};
