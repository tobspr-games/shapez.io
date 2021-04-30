import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";

export class HUDPuzzleEditorControls extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PuzzleEditorControls");

        this.element.innerHTML = T.ingame.puzzleEditorControls.instructions
            .map(text => `<span>${text}</span>`)
            .join("");

        this.titleElement = makeDiv(parent, "ingame_HUD_PuzzleEditorTitle");
        this.titleElement.innerText = T.ingame.puzzleEditorControls.title;
    }

    initialize() {}
}
