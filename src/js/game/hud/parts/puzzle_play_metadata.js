import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";

export class HUDPuzzlePlayMetadata extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PuzzlePlayMetadata");

        this.titleElement = makeDiv(parent, "ingame_HUD_PuzzleEditorTitle");
        // this.titleElement.innerText = T.ingame.PuzzlePlayMetadata.title;
        this.titleElement.innerText = "tobspr's first puzzle";
    }

    initialize() {}
}
