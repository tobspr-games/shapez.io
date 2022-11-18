import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { globalConfig } from "../../core/config";
export class BooleanItem extends BaseItem {
    static getId(): any {
        return "boolean_item";
    }
    static getSchema(): any {
        return types.uint;
    }
    serialize(): any {
        return this.value;
    }
    deserialize(data: any): any {
        this.value = data;
    }
    /** {} **/
    getItemType(): "boolean" {
        return "boolean";
    }
    /**
     * {}
     */
    getAsCopyableKey(): string {
        return this.value ? "1" : "0";
    }
    public value = value ? 1 : 0;

        constructor(value) {
        super();
    }
        equalsImpl(other: BaseItem): any {
        return this.value === other as BooleanItem).value;
    }
        drawItemCenteredImpl(x: number, y: number, parameters: DrawParameters, diameter: number = globalConfig.defaultItemDiameter): any {
        let sprite: any;
        if (this.value) {
            sprite = Loader.getSprite("sprites/wires/boolean_true.png");
        }
        else {
            sprite = Loader.getSprite("sprites/wires/boolean_false.png");
        }
        sprite.drawCachedCentered(parameters, x, y, diameter);
    }
    /**
     * Draws the item to a canvas
     */
    drawFullSizeOnCanvas(context: CanvasRenderingContext2D, size: number): any {
        let sprite: any;
        if (this.value) {
            sprite = Loader.getSprite("sprites/wires/boolean_true.png");
        }
        else {
            sprite = Loader.getSprite("sprites/wires/boolean_false.png");
        }
        sprite.drawCentered(context, size / 2, size / 2, size);
    }
}
export const BOOL_FALSE_SINGLETON: any = new BooleanItem(0);
export const BOOL_TRUE_SINGLETON: any = new BooleanItem(1);
/**
 * Returns whether the item is Boolean and TRUE
 * {}
 */
export function isTrueItem(item: BaseItem): boolean {
    return item && item.getItemType() === "boolean" && !!( tem as BooleanItem).value);
}
/**
 * Returns whether the item is truthy
 * {}
 */
export function isTruthyItem(item: BaseItem): boolean {
    if (!item) {
        return false;
    }
    if (item.getItemType() === "boolean") {
        return !!( tem as BooleanItem).value);
    }
    return true;
}
