import { globalConfig } from "../../core/config";
import { smoothenDpi } from "../../core/dpi_manager";
import { DrawParameters } from "../../core/draw_parameters";
import { types } from "../../savegame/serialization";
import { BaseItem, enumItemType } from "../base_item";

export class PositiveEnergyItem extends BaseItem {
    static getId() {
        return "positive_energy";
    }

    static getSchema() {
        return types.uint;
    }

    serialize() {
        return 0;
    }

    deserialize(data) {}

    getItemType() {
        return enumItemType.positiveEnergy;
    }

    constructor() {
        super();
        this.bufferGenerator = null;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} size
     * @param {DrawParameters} parameters
     */
    draw(x, y, parameters, size = 12) {
        if (!this.bufferGenerator) {
            this.bufferGenerator = this.internalGenerateBuffer.bind(this);
        }

        const dpi = smoothenDpi(globalConfig.shapesSharpness * parameters.zoomLevel);

        const key = "neg:" + size + "/" + dpi;
        const canvas = parameters.root.buffers.getForKey(key, "", size, size, dpi, this.bufferGenerator);
        parameters.context.drawImage(canvas, x - size / 2, y - size / 2, size, size);
    }
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    internalGenerateBuffer(canvas, context, w, h, dpi) {
        context.translate((w * dpi) / 2, (h * dpi) / 2);
        context.scale((dpi * w) / 12, (dpi * h) / 12);

        context.fillStyle = "#eee";
        context.lineWidth = 1;
        context.beginCircle(0, 0, 4);
        context.fill();
    }
}

export const POSITIVE_ENERGY_ITEM_SINGLETON = new PositiveEnergyItem();
