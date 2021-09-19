/* typehints:start */
import { PuzzlePlayGameMode } from "../../modes/puzzle_play";
/* typehints:end */

import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";

import { BaseHUDPart } from "../base_hud_part";

export class HUDPuzzleNextPuzzle extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PuzzleNextPuzzle");
        this.button = document.createElement("button");
        this.button.classList.add("button");
        this.button.innerText = T.ingame.puzzleCompletion.nextPuzzle;
        this.element.appendChild(this.button);

        this.trackClicks(this.button, this.nextPuzzle);
    }

    initialize() {}

    nextPuzzle() {
        const gameMode = /** @type {PuzzlePlayGameMode} */ (this.root.gameMode);
        this.root.gameState.moveToState("PuzzleMenuState", {
            continueQueue: gameMode.nextPuzzles,
        });
    }
}
