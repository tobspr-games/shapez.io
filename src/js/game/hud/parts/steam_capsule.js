import { globalConfig, THIRDPARTY_URLS } from "../../../core/config";
import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

const showCapsuleAfter = 30 * 60;

export class HUDSteamCapsule extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_SteamCapsule");
    }

    initialize() {
        const discount = globalConfig.currentDiscount > 0 ? "_discount" + globalConfig.currentDiscount : "";

        this.domAttach = new DynamicDomAttach(this.root, this.element);

        this.trackClicks(this.element, () => {
            this.root.app.platformWrapper.openExternalLink(
                THIRDPARTY_URLS.stanaloneCampaignLink +
                    "/shapez_steamcapsule" +
                    discount +
                    (G_IS_STEAM_DEMO ? "_steamdemo" : "")
            );
        });
    }

    update() {
        this.domAttach.update(this.root.time.now() > showCapsuleAfter);
    }
}
