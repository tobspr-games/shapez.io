import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";

export class HUDBetaOverlay extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_BetaOverlay", [], "BETA VERSION");
    }

    initialize() {}
}
