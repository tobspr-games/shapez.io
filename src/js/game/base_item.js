import { DrawParameters } from "../core/draw_parameters";
import { BasicSerializableObject, types } from "../savegame/serialization";

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

    /**
     * Draws the item at the given position
     * @param {number} x
     * @param {number} y
     * @param {DrawParameters} parameters
     * @param {number=} size
     */
    draw(x, y, parameters, size) {}

    getBackgroundColorAsResource() {
        return "#eaebec";
    }
}
