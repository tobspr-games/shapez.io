import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";

export class HUDModeMenu extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_ModeMenu");

        this.settingsButton = makeDiv(this.element, null, ["button", "settings"]);
        this.trackClicks(this.settingsButton, this.openSettings);
    }

    openSettings() {
        this.root.hud.parts.modeSettings.toggle();
    }

    initialize() {}
}
