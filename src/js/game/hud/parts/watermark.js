import { globalConfig, openStandaloneLink } from "../../../core/config";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";

export class HUDWatermark extends BaseHUDPart {
    createElements(parent) {
        let linkText = T.ingame.watermark.get_on_steam;

        this.linkElement = makeDiv(
            parent,
            "ingame_HUD_WatermarkClicker",
            globalConfig.currentDiscount > 0 ? ["withDiscount"] : [],
            linkText +
                (globalConfig.currentDiscount > 0
                    ? `<span class='discount'>-${globalConfig.currentDiscount}%!</span>`
                    : "")
        );
        this.trackClicks(this.linkElement, () => {
            openStandaloneLink(this.root.app, "shapez_watermark");
        });
    }

    initialize() {}

    update() {}

    /**
     *
     * @param {import("../../../core/draw_utils").DrawParameters} parameters
     */
    drawOverlays(parameters) {
        const w = this.root.gameWidth;

        parameters.context.fillStyle = "rgba(20, 30, 40, 0.25)";
        parameters.context.font = "bold " + this.root.app.getEffectiveUiScale() * 40 + "px GameFont";
        parameters.context.textAlign = "center";
        parameters.context.fillText(
            T.demoBanners.title.toUpperCase(),
            w / 2,
            this.root.app.getEffectiveUiScale() * 50
        );

        parameters.context.textAlign = "left";
    }
}
