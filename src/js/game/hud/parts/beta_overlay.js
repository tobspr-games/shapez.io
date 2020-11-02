import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";

export class HUDBetaOverlay extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_BetaOverlay",
            [],
            "<h2>UNSTABLE BETA VERSION</h2><span>Unfinalized & potential buggy content!</span>"
        );
    }

    initialize() {}
}
