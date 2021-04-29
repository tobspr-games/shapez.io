import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";

export class HUDPuzzleEditorControls extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PuzzleEditorControls");

        this.element.innerHTML = `

            <span>1. Build constant producers to generate resources.</span>
            <span>2. Build goal acceptors the capture shapes.</span>
            <span>3. Produce your desired shape(s) within the puzzle area and deliver it to the goal acceptors, which will capture it.</span>
            <span>4. Once you are done, press 'Playtest' to validate your puzzle.</span>
        `;

        this.titleElement = makeDiv(parent, "ingame_HUD_PuzzleEditorTitle");
        this.titleElement.innerText = "Puzzle Editor";
    }

    initialize() {}
}
