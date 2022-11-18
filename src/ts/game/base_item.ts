import { globalConfig } from "../core/config";
import { DrawParameters } from "../core/draw_parameters";
import { BasicSerializableObject } from "../savegame/serialization";
/**
 * Class for items on belts etc. Not an entity for performance reasons
 */
export class BaseItem extends BasicSerializableObject {
    public _type = this.getItemType();

    constructor() {
        super();
    }
    static getId(): any {
        return "base_item";
    }
    /** {} */
    static getSchema(): import("../savegame/serialization").Schema {
        return {};
    }
    /** {} **/
    getItemType(): ItemType {
        abstract;
        return "shape";
    }
    /**
     * Returns a string id of the item
     * {}
     * @abstract
     */
    getAsCopyableKey(): string {
        abstract;
        return "";
    }
    /**
     * Returns if the item equals the other itme
     * {}
     */
    equals(other: BaseItem): boolean {
        if (this.getItemType() !== other.getItemType()) {
            return false;
        }
        return this.equalsImpl(other);
    }
    /**
     * Override for custom comparison
     * {}
     * @abstract
     */
    equalsImpl(other: BaseItem): boolean {
        abstract;
        return false;
    }
    /**
     * Draws the item to a canvas
     * @abstract
     */
    drawFullSizeOnCanvas(context: CanvasRenderingContext2D, size: number): any {
        abstract;
    }
    /**
     * Draws the item at the given position
     */
    drawItemCenteredClipped(x: number, y: number, parameters: DrawParameters, diameter: number= = globalConfig.defaultItemDiameter): any {
        if (parameters.visibleRect.containsCircle(x, y, diameter / 2)) {
            this.drawItemCenteredImpl(x, y, parameters, diameter);
        }
    }
    /**
     * INTERNAL
     * @abstract
     */
    drawItemCenteredImpl(x: number, y: number, parameters: DrawParameters, diameter: number= = globalConfig.defaultItemDiameter): any {
        abstract;
    }
    getBackgroundColorAsResource(): any {
        abstract;
        return "";
    }
}
