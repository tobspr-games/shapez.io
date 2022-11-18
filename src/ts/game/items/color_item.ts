import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { enumColors } from "../colors";
import { THEME } from "../theme";
export class ColorItem extends BaseItem {
    static getId() {
        return "color";
    }
    static getSchema() {
        return types.enum(enumColors);
    }
    serialize() {
        return this.color;
    }
    deserialize(data) {
        this.color = data;
    }
    /** {} **/
    getItemType(): "color" {
        return "color";
    }
    /**
     * {}
     */
    getAsCopyableKey(): string {
        return this.color;
    }
        equalsImpl(other: BaseItem) {
        return this.color === other as ColorItem).color;
    }
    public color = color;

        constructor(color) {
        super();
    }
    getBackgroundColorAsResource() {
        return THEME.map.resources[this.color];
    }
    /**
     * Draws the item to a canvas
     */
    drawFullSizeOnCanvas(context: CanvasRenderingContext2D, size: number) {
        if (!this.cachedSprite) {
            this.cachedSprite = Loader.getSprite("sprites/colors/" + this.color + ".png");
        }
        this.cachedSprite.drawCentered(context, size / 2, size / 2, size);
    }
        drawItemCenteredClipped(x: number, y: number, parameters: DrawParameters, diameter: number = globalConfig.defaultItemDiameter) {
        const realDiameter = diameter * 0.6;
        if (!this.cachedSprite) {
            this.cachedSprite = Loader.getSprite("sprites/colors/" + this.color + ".png");
        }
        this.cachedSprite.drawCachedCentered(parameters, x, y, realDiameter);
    }
}
/**
 * Singleton instances
 */
export const COLOR_ITEM_SINGLETONS: {
    [idx: enumColors]: ColorItem;
} = {};
for (const color in enumColors) {
    COLOR_ITEM_SINGLETONS[color] = new ColorItem(color);
}
