import { globalConfig, openStandaloneLink } from "../../../core/config";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";

export class HUDWatermark extends BaseHUDPart {
    createElements(parent) {
        // To be continued later
        // let linkText = "";
        // switch (this.root.app.gameAnalytics.abtVariant) {
        //     case "0": {
        //         linkText = "Get on Steam";
        //         break;
        //     }
        //     case "1": {
        //         linkText = "Play on Steam";
        //         break;
        //     }
        //     case "2": {
        //         linkText = T.ingame.watermark.get_on_steam;
        //         break;
        //     }
        // }

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
}
