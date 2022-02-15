import { globalConfig } from "../core/config";
import { DrawParameters } from "../core/draw_parameters";
import { BasicSerializableObject } from "../savegame/serialization";

/**
 * Class for items on belts etc. Not an entity for performance reasons
 */
export class BaseItem extends BasicSerializableObject {
    constructor() {
        super();
        this._type = this.getItemType();
    }

    static getId() {
        return "base_item";
    }

    /** @returns {import("../savegame/serialization").Schema} */
    static getSchema() {
        return {};
    }

    /** @returns {ItemType} **/
    getItemType() {
        abstract;
        return "shape";
    }

    /**
     * Returns a string id of the item
     * @returns {string}
     * @abstract
     */
    getAsCopyableKey() {
        abstract;
        return "";
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
     * @param {BaseItem} other
     * @returns {boolean}
     * @abstract
     */
    equalsImpl(other) {
        abstract;
        return false;
    }

    /**
     * Draws the item to a canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} size
     * @abstract
     */
    drawFullSizeOnCanvas(context, size) {
        abstract;
    }

    /**
     * Draws the item at the given position
     * @param {number} x
     * @param {number} y
     * @param {DrawParameters} parameters
     * @param {number=} diameter
     */
    drawItemCenteredClipped(x, y, parameters, diameter = globalConfig.defaultItemDiameter) {
        if (parameters.visibleRect.containsCircle(x, y, diameter / 2)) {
            this.drawItemCenteredImpl(x, y, parameters, diameter);
        }
    }

    /**
     * INTERNAL
     * @param {number} x
     * @param {number} y
     * @param {DrawParameters} parameters
     * @param {number=} diameter
     * @abstract
     */
    drawItemCenteredImpl(x, y, parameters, diameter = globalConfig.defaultItemDiameter) {
        abstract;
    }

    getBackgroundColorAsResource() {
        abstract;
        return "";
    }
}
