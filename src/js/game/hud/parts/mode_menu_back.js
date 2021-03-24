import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";

export class HUDModeMenuBack extends BaseHUDPart {
    createElements(parent) {
        const key = this.root.gameMode.getId();

        this.element = makeDiv(parent, "ingame_HUD_ModeMenuBack");
        this.button = document.createElement("button");
        this.button.classList.add("button");
        this.button.textContent = "⬅ " + T.ingame.modeMenu[key].back.title;
        this.element.appendChild(this.button);

        this.trackClicks(this.button, this.back);
    }

    initialize() {}

    back() {
        this.root.gameState.goBackToMenu();
    }
}
