import { globalConfig } from "../../core/config";
import { smoothenDpi } from "../../core/dpi_manager";
import { DrawParameters } from "../../core/draw_parameters";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { enumColors, enumColorsToHexCode } from "../colors";
import { THEME } from "../theme";
import { drawSpriteClipped } from "../../core/draw_utils";

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

    /** @returns {"color"} **/
    getItemType() {
        return "color";
    }

    /**
     * @param {BaseItem} other
     */
    equalsImpl(other) {
        return this.color === /** @type {ColorItem} */ (other).color;
    }

    /**
     * @param {enumColors} color
     */
    constructor(color) {
        super();
        this.color = color;
        this.bufferGenerator = null;
    }

    getBackgroundColorAsResource() {
        return THEME.map.resources[this.color];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} diameter
     * @param {DrawParameters} parameters
     */
    drawItemCenteredImpl(x, y, parameters, diameter = globalConfig.defaultItemDiameter) {
        if (!this.bufferGenerator) {
            this.bufferGenerator = this.internalGenerateColorBuffer.bind(this);
        }

        const realDiameter = diameter * 0.6;
        const dpi = smoothenDpi(globalConfig.shapesSharpness * parameters.zoomLevel);
        const key = realDiameter + "/" + dpi + "/" + this.color;
        const canvas = parameters.root.buffers.getForKey({
            key: "coloritem",
            subKey: key,
            w: realDiameter,
            h: realDiameter,
            dpi,
            redrawMethod: this.bufferGenerator,
        });

        drawSpriteClipped({
            parameters,
            sprite: canvas,
            x: x - realDiameter / 2,
            y: y - realDiameter / 2,
            w: realDiameter,
            h: realDiameter,
            originalW: realDiameter * dpi,
            originalH: realDiameter * dpi,
        });
    }
    /**
     *
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    internalGenerateColorBuffer(canvas, context, w, h, dpi) {
        context.translate((w * dpi) / 2, (h * dpi) / 2);
        context.scale((dpi * w) / 12, (dpi * h) / 12);

        context.fillStyle = enumColorsToHexCode[this.color];
        context.strokeStyle = THEME.items.outline;
        context.lineWidth = 2 * THEME.items.outlineWidth;
        context.beginCircle(2, -1, 3);
        context.stroke();
        context.fill();
        context.beginCircle(-2, -1, 3);
        context.stroke();
        context.fill();
        context.beginCircle(0, 2, 3);
        context.closePath();
        context.stroke();
        context.fill();
    }
}

/**
 * Singleton instances
 * @type {Object<enumColors, ColorItem>}
 */
export const COLOR_ITEM_SINGLETONS = {};

for (const color in enumColors) {
    COLOR_ITEM_SINGLETONS[color] = new ColorItem(color);
}
