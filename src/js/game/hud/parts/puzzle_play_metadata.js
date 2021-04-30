import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";

export class HUDPuzzlePlayMetadata extends BaseHUDPart {
    createElements(parent) {
        this.titleElement = makeDiv(parent, "ingame_HUD_PuzzlePlayTitle");
        this.titleElement.innerText = "PUZZLE";

        this.puzzleNameElement = makeDiv(this.titleElement, null, ["name"]);
        this.puzzleNameElement.innerText = "tobspr's first puzzle";

        this.element = makeDiv(parent, "ingame_HUD_PuzzlePlayMetadata");
        this.element.innerHTML = `

            <div class="author">Author: tobspr</div>
            <div class="plays">Plays: 12.000</div>
            <div class="likes">Likes: 512</div>
            `;
    }

    initialize() {}
}
