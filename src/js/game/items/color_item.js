import { DrawParameters } from "../../core/draw_parameters";
import { createLogger } from "../../core/logging";
import { extendSchema } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { enumColorsToHexCode, enumColors } from "../colors";
import { makeOffscreenBuffer } from "../../core/buffer_utils";
import { globalConfig } from "../../core/config";
import { round1Digit } from "../../core/utils";
import { Math_max, Math_round } from "../../core/builtins";
import { smoothenDpi } from "../../core/dpi_manager";

/** @enum {string} */
const enumColorToMapBackground = {
    [enumColors.red]: "#ffbfc1",
    [enumColors.green]: "#cbffc4",
    [enumColors.blue]: "#bfdaff",
};

export class ColorItem extends BaseItem {
    static getId() {
        return "color";
    }

    static getSchema() {
        return extendSchema(BaseItem.getCachedSchema(), {
            // TODO
        });
    }

    /**
     * @param {string} color
     */
    constructor(color) {
        super();
        this.color = color;

        this.bufferGenerator = this.internalGenerateColorBuffer.bind(this);
    }

    getBackgroundColorAsResource() {
        return enumColorToMapBackground[this.color];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} size
     * @param {DrawParameters} parameters
     */
    draw(x, y, parameters, size = 12) {
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
        context.strokeStyle = "rgba(100,102, 110, 1)";
        context.lineWidth = 2;
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
