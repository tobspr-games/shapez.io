import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";

export class HUDModeMenuNext extends BaseHUDPart {
    createElements(parent) {
        const key = this.root.gameMode.getId();

        this.element = makeDiv(parent, "ingame_HUD_ModeMenuNext");
        this.button = document.createElement("button");
        this.button.classList.add("button");
        this.button.textContent = T.ingame.modeMenu[key].next.title + " ➡ ";
        this.element.appendChild(this.button);

        this.content = makeDiv(this.element, null, ["content"], T.ingame.modeMenu[key].next.desc);

        this.trackClicks(this.button, this.next);
    }

    initialize() {}

    next() {}
}
