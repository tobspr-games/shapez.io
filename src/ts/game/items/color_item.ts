import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { enumColors } from "../colors";
import { THEME } from "../theme";
export class ColorItem extends BaseItem {
    static getId(): any {
        return "color";
    }
    static getSchema(): any {
        return types.enum(enumColors);
    }
    serialize(): any {
        return this.color;
    }
    deserialize(data: any): any {
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
        equalsImpl(other: BaseItem): any {
        return this.color === other as ColorItem).color;
    }
    public color = color;

        constructor(color) {
        super();
    }
    getBackgroundColorAsResource(): any {
        return THEME.map.resources[this.color];
    }
    /**
     * Draws the item to a canvas
     */
    drawFullSizeOnCanvas(context: CanvasRenderingContext2D, size: number): any {
        if (!this.cachedSprite) {
            this.cachedSprite = Loader.getSprite("sprites/colors/" + this.color + ".png");
        }
        this.cachedSprite.drawCentered(context, size / 2, size / 2, size);
    }
        drawItemCenteredClipped(x: number, y: number, parameters: DrawParameters, diameter: number = globalConfig.defaultItemDiameter): any {
        const realDiameter: any = diameter * 0.6;
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
for (const color: any in enumColors) {
    COLOR_ITEM_SINGLETONS[color] = new ColorItem(color);
}
