import { BaseHUDPart } from "../base_hud_part";
import { DrawParameters } from "../../../core/draw_parameters";

export class HUDWatermark extends BaseHUDPart {
    createElements() {}

    initialize() {}

    /**
     *
     * @param {DrawParameters} parameters
     */
    drawOverlays(parameters) {
        const w = this.root.gameWidth;

        parameters.context.fillStyle = "#f77";
        parameters.context.font = "50px GameFont";
        parameters.context.textAlign = "center";
        parameters.context.fillText("DEMO VERSION", w / 2, 100);

        parameters.context.fillStyle = "#aaaca9";
        parameters.context.font = "20px GameFont";
        parameters.context.fillText("Get shapez.io on steam for the full experience!", w / 2, 140);

        parameters.context.textAlign = "left";
    }
}
