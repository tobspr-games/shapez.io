/* typehints:start */
import { PuzzlePlayGameMode } from "../../modes/puzzle_play";
/* typehints:end */

import { formatBigNumberFull, formatSeconds, makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";

const copy = require("clipboard-copy");

export class HUDPuzzlePlayMetadata extends BaseHUDPart {
    createElements(parent) {
        this.titleElement = makeDiv(parent, "ingame_HUD_PuzzlePlayTitle");
        this.titleElement.innerText = "PUZZLE";

        const mode = /** @type {PuzzlePlayGameMode} */ (this.root.gameMode);
        const puzzle = mode.puzzle;

        this.puzzleNameElement = makeDiv(this.titleElement, null, ["name"]);
        this.puzzleNameElement.innerText = puzzle.meta.title;

        this.element = makeDiv(parent, "ingame_HUD_PuzzlePlayMetadata");
        this.element.innerHTML = `

            <div class="plays">
                <span class="downloads">${formatBigNumberFull(puzzle.meta.downloads)}</span>
                <span class="likes">${formatBigNumberFull(puzzle.meta.likes)}</span>
            </div>


            <div class="info author"><label>${T.ingame.puzzleMetadata.author}</label><span></span></div>
            <div class="info key">
                <label>${T.ingame.puzzleMetadata.shortKey}</label><span>${puzzle.meta.shortKey}</span>
            </div>
            <div class="info rating">
                <label>${T.ingame.puzzleMetadata.averageDuration}</label>
                <span>${puzzle.meta.averageTime ? formatSeconds(puzzle.meta.averageTime) : "-"}</span>
            </div>
            <div class="info rating">
                <label>${T.ingame.puzzleMetadata.completionRate}</label>
                <span>${
                    puzzle.meta.downloads > 0
                        ? ((puzzle.meta.completions / puzzle.meta.downloads) * 100.0).toFixed(1) + "%"
                        : "-"
                }</span>
            </div>

            <div class="buttons">
                <button class="styledButton share">${T.ingame.puzzleEditorSettings.share}</button>
                <button class="styledButton report">${T.ingame.puzzleEditorSettings.report}</button>
            </div>
            `;

        this.trackClicks(this.element.querySelector("button.share"), this.share);
        this.trackClicks(this.element.querySelector("button.report"), this.report);

        /** @type {HTMLElement} */ (this.element.querySelector(".author span")).innerText =
            puzzle.meta.author;
    }

    initialize() {}

    share() {
        const mode = /** @type {PuzzlePlayGameMode} */ (this.root.gameMode);
        mode.sharePuzzle();
    }

    report() {
        const mode = /** @type {PuzzlePlayGameMode} */ (this.root.gameMode);
        mode.reportPuzzle();
    }
}
