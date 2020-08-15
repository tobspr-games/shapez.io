import { DrawParameters } from "../core/draw_parameters";
import { BasicSerializableObject } from "../savegame/serialization";

/** @type {ItemType[]} **/
export const itemTypes = ["shape", "color", "boolean"];

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

    /** @returns {ItemType} **/
    getItemType() {
        abstract;
        return "shape";
    }

    /**
     * Returns if the item equals the other itme
     * @param {BaseItem} other
     * @returns {boolean}
     */
    equals(other) {
        if (this.getItemType() !== other.getItemType()) {
            return false;
        }
        return this.equalsImpl(other);
    }

    /**
     * Override for custom comparison
     * @abstract
     * @param {BaseItem} other
     * @returns {boolean}
     */
    equalsImpl(other) {
        abstract;
        return false;
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
