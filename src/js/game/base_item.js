import { DrawParameters } from "../core/draw_parameters";
import { BasicSerializableObject } from "../savegame/serialization";

/**
 * @typedef {import("./root").Layer} Layer
 *
 * @typedef {"shape" | "color" | "positiveEnergy" | "negativeEnergy" | "genericEnergy"} ItemType
 */

/** @type {ItemType[]} **/
export const itemTypes = ["shape", "color", "positiveEnergy", "negativeEnergy", "genericEnergy"];

/** @type {Record<ItemType, Layer>} **/
export const itemTypeLayerMap = {
    shape: "regular",
    color: "regular",
    positiveEnergy: "wires",
    negativeEnergy: "wires",
    genericEnergy: "wires",
};

/**
 * Class for items on belts etc. Not an entity for performance reasons
 */
export class BaseItem extends BasicSerializableObject {
    static getId() {
        return "base_item";
    }

    /** @returns {object} */
    static getSchema() {
        return {};
    }

    /** @abstract @returns {ItemType} **/
    getItemType() {
        abstract;
        return "shape";
    }

    /**
     * Draws the item at the given position
     * @param {number} x
     * @param {number} y
     * @param {DrawParameters} parameters
     * @param {number=} size
     */
    draw(x, y, parameters, size) {}

    getBackgroundColorAsResource() {
        abstract;
        return "";
    }
}
