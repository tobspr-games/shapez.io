import { globalConfig } from "../../core/config";
import { smoothenDpi } from "../../core/dpi_manager";
import { DrawParameters } from "../../core/draw_parameters";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { enumColors, enumColorsToHexCode } from "../colors";
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

    /**
     * @param {enumColors} color
     */
    constructor(color) {
        super();
        this.color = color;
        this.bufferGenerator = null;
    }

    getBackgroundColorAsResource() {
        return THEME.map.resources[this.color] || THEME.map.resources.shape;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} size
     * @param {DrawParameters} parameters
     */
    draw(x, y, parameters, size = 12) {
        if (!this.bufferGenerator) {
            this.bufferGenerator = this.internalGenerateColorBuffer.bind(this);
        }

        const dpi = smoothenDpi(globalConfig.shapesSharpness * parameters.zoomLevel);

        const key = size + "/" + dpi;
        const canvas = parameters.root.buffers.getForKey(
            key,
            this.color,
            size,
            size,
            dpi,
            this.bufferGenerator
        );
        parameters.context.drawImage(canvas, x - size / 2, y - size / 2, size, size);
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
