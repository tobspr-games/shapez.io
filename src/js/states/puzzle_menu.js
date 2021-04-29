import { globalConfig } from "../core/config";
import { TextualGameState } from "../core/textual_game_state";
import { formatBigNumberFull } from "../core/utils";
import { enumGameModeIds } from "../game/game_mode";
import { ShapeDefinition } from "../game/shape_definition";
import { T } from "../translations";

const categories = ["levels", "new", "topRated", "myPuzzles"];

/**
 * @typedef {{
 *    shortKey: string;
 *    upvotes: number;
 *    playcount: number;
 *    title: string;
 *    author: string;
 *    completed: boolean;
 * }} PuzzleMetadata
 */

const SAMPLE_PUZZLE = {
    shortKey: "CuCuCuCu",
    upvotes: 10000,
    playcount: 1000,
    title: "Level 1",
    author: "verylongsteamnamewhichbreaks",
    completed: false,
};
const BUILTIN_PUZZLES = [
    { ...SAMPLE_PUZZLE, completed: true },
    { ...SAMPLE_PUZZLE, completed: true },
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
    SAMPLE_PUZZLE,
];

export class PuzzleMenuState extends TextualGameState {
    constructor() {
        super("PuzzleMenuState");
        this.loading = false;
        this.activeCategory = "";
    }

    getStateHeaderTitle() {
        return T.puzzleMenu.title;
    }
    /**
     * Overrides the GameState implementation to provide our own html
     */
    internalGetFullHtml() {
        let headerHtml = `
            <div class="headerBar">
                <h1><button class="backButton"></button> ${this.getStateHeaderTitle()}</h1>

                <div class="actions">
                    <button class="styledButton createPuzzle">+ ${T.puzzleMenu.createPuzzle}</button>
                </div>
            </div>`;

        return `
            ${headerHtml}
            <div class="container">
                    ${this.getInnerHTML()}
            </div>
        `;
    }

    getMainContentHTML() {
        let html = `


                <div class="categoryChooser">
                    ${categories
                        .map(
                            category => `
                             <button data-category="${category}" class="styledButton category">${T.puzzleMenu.categories[category]}</button>
                        `
                        )
                        .join("")}
                </div>

                <div class="puzzles" id="mainContainer">
                    <div class="puzzle"></div>
                    <div class="puzzle"></div>
                    <div class="puzzle"></div>
                    <div class="puzzle"></div>
                </div>
        `;

        return html;
    }

    selectCategory(category) {
        if (category === this.activeCategory) {
            return;
        }
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.activeCategory = category;

        const activeCategory = this.htmlElement.querySelector(".active[data-category]");
        if (activeCategory) {
            activeCategory.classList.remove("active");
        }

        this.htmlElement.querySelector(`[data-category="${category}"]`).classList.add("active");

        const container = this.htmlElement.querySelector("#mainContainer");
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const loadingElement = document.createElement("div");
        loadingElement.classList.add("loader");
        loadingElement.innerText = T.global.loading + "...";
        container.appendChild(loadingElement);

        this.asyncChannel
            .watch(this.getPuzzlesForCategory(category))
            .then(
                puzzles => this.renderPuzzles(puzzles),
                error => {
                    this.dialogs.showWarning(
                        T.dialogs.puzzleLoadFailed.title,
                        T.dialogs.puzzleLoadFailed.desc + " " + error
                    );
                }
            )
            .then(() => (this.loading = false));
    }

    /**
     *
     * @param {PuzzleMetadata[]} puzzles
     */
    renderPuzzles(puzzles) {
        const container = this.htmlElement.querySelector("#mainContainer");
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        for (const puzzle of puzzles) {
            const elem = document.createElement("div");
            elem.classList.add("puzzle");
            elem.classList.toggle("completed", puzzle.completed);

            if (puzzle.title) {
                const title = document.createElement("div");
                title.classList.add("title");
                title.innerText = puzzle.title;
                elem.appendChild(title);
            }

            if (puzzle.author) {
                const author = document.createElement("div");
                author.classList.add("author");
                author.innerText = "by " + puzzle.author;
                elem.appendChild(author);
            }

            if (puzzle.upvotes) {
                const upvotes = document.createElement("div");
                upvotes.classList.add("upvotes");
                upvotes.innerText = formatBigNumberFull(puzzle.upvotes);
                elem.appendChild(upvotes);
            }

            if (puzzle.playcount) {
                const playcount = document.createElement("div");
                playcount.classList.add("playcount");
                playcount.innerText = String(puzzle.playcount) + " plays";
                elem.appendChild(playcount);
            }

            const definition = ShapeDefinition.fromShortKey(puzzle.shortKey);
            const canvas = definition.generateAsCanvas(100 * this.app.getEffectiveUiScale());

            const icon = document.createElement("div");
            icon.classList.add("icon");
            icon.appendChild(canvas);
            elem.appendChild(icon);

            container.appendChild(elem);
        }
    }

    getPuzzlesForCategory(category) {
        return new Promise(resolve => setTimeout(() => resolve(BUILTIN_PUZZLES), 100));
    }

    onEnter() {
        this.selectCategory("levels");

        for (const category of categories) {
            const button = this.htmlElement.querySelector(`[data-category="${category}"]`);
            this.trackClicks(button, () => this.selectCategory(category));
        }

        this.trackClicks(this.htmlElement.querySelector("button.createPuzzle"), this.createNewPuzzle);

        if (G_IS_DEV && globalConfig.debug.testPuzzleMode) {
            this.createNewPuzzle();
        }
    }

    createNewPuzzle() {
        const savegame = this.app.savegameMgr.createNewSavegame();
        this.moveToState("InGameState", {
            gameModeId: enumGameModeIds.puzzleEdit,
            savegame,
        });
    }
}
