import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";

export class HUDBetaOverlay extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_BetaOverlay",
            [],
            "<h2>CLOSED BETA VERSION</h2><span>This version is unstable, might crash and is not final!</span>"
        );
    }

    initialize() {}
}
