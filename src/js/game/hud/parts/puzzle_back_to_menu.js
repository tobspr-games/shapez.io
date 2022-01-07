import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";

export class HUDPuzzleBackToMenu extends BaseHUDPart {
    createElements(parent) {
        const key = this.root.gameMode.getId();

        this.element = makeDiv(parent, "ingame_HUD_PuzzleBackToMenu");
        this.button = document.createElement("button");
        this.button.classList.add("button");
        this.element.appendChild(this.button);

        this.trackClicks(this.button, this.back);
    }

    initialize() {}

    back() {
        this.root.gameState.goBackToMenu();
    }
}
