import { DrawParameters } from "../core/draw_parameters";
import { BasicSerializableObject } from "../savegame/serialization";
import { enumLayer } from "./root";

/** @enum {string} */
export const enumItemType = {
    shape: "shape",
    color: "color",
    positiveEnergy: "positiveEnergy",
    negativeEnergy: "negativeEnergy",

    // Can be used for filters
    genericEnergy: "genericEnergy",
};

/** @enum {enumLayer} */
export const enumItemTypeToLayer = {
    [enumItemType.shape]: enumLayer.regular,
    [enumItemType.color]: enumLayer.regular,
    [enumItemType.positiveEnergy]: enumLayer.wires,
    [enumItemType.negativeEnergy]: enumLayer.wires,
    [enumItemType.genericEnergy]: enumLayer.wires,
};

/**
 * Class for items on belts etc. Not an entity for performance reasons
 */
export class BaseItem extends BasicSerializableObject {
    constructor() {
        super();
    }

    static getId() {
        return "base_item";
    }

    /** @returns {object} */
    static getSchema() {
        return {};
    }

    /** @returns {enumItemType} */
    getItemType() {
        abstract;
        return "";
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
