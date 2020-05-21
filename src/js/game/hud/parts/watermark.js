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
        parameters.context.font = "bold " + this.root.app.getEffectiveUiScale() * 17 + "px GameFont";
        parameters.context.textAlign = "center";
        parameters.context.fillText("DEMO VERSION", w / 2, this.root.app.getEffectiveUiScale() * 35);

        parameters.context.font = "bold " + this.root.app.getEffectiveUiScale() * 12 + "px GameFont";
        parameters.context.textAlign = "center";
        parameters.context.fillText(
            "Please consider to buy the full version!",
            w / 2,
            this.root.app.getEffectiveUiScale() * 55
        );

        parameters.context.textAlign = "left";
    }
}
