import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";

export class HUDPuzzleEditorControls extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PuzzleEditorControls");

        this.element.innerHTML = `

            <span>1. Build constant producers to generate resources.</span>
            <span>2. Build goal acceptors and deliver shapes to set the puzzle goals.</span>
            <span>3. Once you are done, press 'Playtest' to validate your puzzle.</span>
        `;

        this.titleElement = makeDiv(parent, "ingame_HUD_PuzzleEditorTitle");
        this.titleElement.innerText = "Puzzle Editor";
    }

    initialize() {}
}
