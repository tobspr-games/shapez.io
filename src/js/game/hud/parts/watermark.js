import { BaseHUDPart } from "../base_hud_part";
import { DrawParameters } from "../../../core/draw_parameters";
import { makeDiv } from "../../../core/utils";
import { THIRDPARTY_URLS } from "../../../core/config";
import { T } from "../../../translations";

export class HUDWatermark extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_Watermark");
    }

    initialize() {
        this.trackClicks(this.element, this.onWatermarkClick);
    }

    onWatermarkClick() {
        this.root.app.analytics.trackUiClick("watermark_click_2");
        this.root.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.standaloneStorePage);
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    drawOverlays(parameters) {
        const w = this.root.gameWidth;
        const x = 280 * this.root.app.getEffectiveUiScale();

        parameters.context.fillStyle = "#f77";
        parameters.context.font = "bold " + this.root.app.getEffectiveUiScale() * 17 + "px GameFont";
        // parameters.context.textAlign = "center";
        parameters.context.fillText(
            T.demoBanners.title.toUpperCase(),
            x,
            this.root.app.getEffectiveUiScale() * 27
        );

        parameters.context.font = "bold " + this.root.app.getEffectiveUiScale() * 12 + "px GameFont";
        // parameters.context.textAlign = "center";
        parameters.context.fillText(T.demoBanners.intro, x, this.root.app.getEffectiveUiScale() * 45);

        // parameters.context.textAlign = "left";
    }
}
