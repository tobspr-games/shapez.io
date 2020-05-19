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
        parameters.context.font = "bold " + this.root.app.getEffectiveUiScale() * 15 + "px GameFont";
        parameters.context.textAlign = "center";
        parameters.context.fillText("DEMO VERSION", w / 2, 50);

        parameters.context.textAlign = "left";
    }
}
