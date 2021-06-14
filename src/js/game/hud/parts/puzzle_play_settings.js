import { createLogger } from "../../../core/logging";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";

const logger = createLogger("puzzle-play");

export class HUDPuzzlePlaySettings extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PuzzlePlaySettings");

        if (this.root.gameMode.getBuildableZones()) {
            const bind = (selector, handler) =>
                this.trackClicks(this.element.querySelector(selector), handler);
            makeDiv(
                this.element,
                null,
                ["section"],
                `
                        <button class="styledButton clear">${T.ingame.puzzleEditorSettings.clearItems}</button>

                `
            );

            bind("button.clear", this.clear);
        }
    }

    clear() {
        this.root.logic.clearAllBeltsAndItems();
    }

    initialize() {
        this.visible = true;
    }
}
