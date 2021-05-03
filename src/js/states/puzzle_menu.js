import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { DialogWithForm } from "../core/modal_dialog_elements";
import { FormElementInput } from "../core/modal_dialog_forms";
import { TextualGameState } from "../core/textual_game_state";
import { formatBigNumberFull } from "../core/utils";
import { enumGameModeIds } from "../game/game_mode";
import { ShapeDefinition } from "../game/shape_definition";
import { Savegame } from "../savegame/savegame";
import { T } from "../translations";

const categories = ["top-rated", "new", "easy", "short", "hard", "completed", "mine"];

/**
 * @type {import("../savegame/savegame_typedefs").PuzzleMetadata}
 */
const SAMPLE_PUZZLE = {
    id: 1,
    shortKey: "CuCuCuCu",
    downloads: 0,
    likes: 0,
    averageTime: 1,
    completions: 1,
    difficulty: null,
    title: "Level 1",
    author: "verylongsteamnamewhichbreaks",
    completed: false,
};

/**
 * @type {import("../savegame/savegame_typedefs").PuzzleMetadata[]}
 */
const BUILTIN_PUZZLES = G_IS_DEV
    ? [
          //   { ...SAMPLE_PUZZLE, completed: true },
          //   { ...SAMPLE_PUZZLE, completed: true },
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
          //   SAMPLE_PUZZLE,
      ]
    : [];

const logger = createLogger("puzzle-menu");

let lastCategory = categories[0];

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
                    <button class="styledButton loadPuzzle">${T.puzzleMenu.loadPuzzle}</button>
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

                <div class="puzzles" id="mainContainer"></div>
        `;

        return html;
    }

    selectCategory(category) {
        lastCategory = category;
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
                    this.renderPuzzles([]);
                }
            )
            .then(() => (this.loading = false));
    }

    /**
     *
     * @param {import("../savegame/savegame_typedefs").PuzzleMetadata[]} puzzles
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

            const stats = document.createElement("div");
            stats.classList.add("stats");
            elem.appendChild(stats);

            if (puzzle.downloads > 0) {
                const difficulty = document.createElement("div");
                difficulty.classList.add("difficulty");

                const completionPercentage = Math.round((puzzle.completions / puzzle.downloads) * 100.0);
                difficulty.innerText = completionPercentage + "%";
                stats.appendChild(difficulty);

                if (completionPercentage < 10) {
                    difficulty.classList.add("stage--hard");
                } else if (completionPercentage < 30) {
                    difficulty.classList.add("stage--medium");
                } else if (completionPercentage < 60) {
                    difficulty.classList.add("stage--normal");
                } else {
                    difficulty.classList.add("stage--easy");
                }
            }

            const downloads = document.createElement("div");
            downloads.classList.add("downloads");
            downloads.innerText = String(puzzle.downloads);
            stats.appendChild(downloads);

            const likes = document.createElement("div");
            likes.classList.add("likes");
            likes.innerText = formatBigNumberFull(puzzle.likes);
            stats.appendChild(likes);

            const definition = ShapeDefinition.fromShortKey(puzzle.shortKey);
            const canvas = definition.generateAsCanvas(100 * this.app.getEffectiveUiScale());

            const icon = document.createElement("div");
            icon.classList.add("icon");
            icon.appendChild(canvas);
            elem.appendChild(icon);

            container.appendChild(elem);

            this.trackClicks(elem, () => this.playPuzzle(puzzle));
        }

        if (puzzles.length === 0) {
            const elem = document.createElement("div");
            elem.classList.add("empty");
            elem.innerText = T.puzzleMenu.noPuzzles;
            container.appendChild(elem);
        }
    }

    /**
     *
     * @param {*} category
     * @returns {Promise<import("../savegame/savegame_typedefs").PuzzleMetadata[]}
     */
    getPuzzlesForCategory(category) {
        if (category === "levels") {
            return Promise.resolve(BUILTIN_PUZZLES);
        }

        const result = this.app.clientApi.apiListPuzzles(category);
        return result.catch(err => {
            logger.error("Failed to get", category, ":", err);
            throw err;
        });
    }

    /**
     *
     * @param {import("../savegame/savegame_typedefs").PuzzleMetadata} puzzle
     */
    playPuzzle(puzzle) {
        const closeLoading = this.dialogs.showLoadingDialog();

        this.app.clientApi.apiDownloadPuzzle(puzzle.id).then(
            puzzleData => {
                closeLoading();
                logger.log("Got puzzle:", puzzleData);
                this.startLoadedPuzzle(puzzleData);
            },
            err => {
                closeLoading();
                logger.error("Failed to download puzzle", puzzle.id, ":", err);
                this.dialogs.showWarning(
                    T.dialogs.puzzleDownloadError.title,
                    T.dialogs.puzzleDownloadError.desc + " " + err
                );
            }
        );
    }

    /**
     *
     * @param {import("../savegame/savegame_typedefs").PuzzleFullData} puzzle
     */
    startLoadedPuzzle(puzzle) {
        const savegame = this.createEmptySavegame();
        this.moveToState("InGameState", {
            gameModeId: enumGameModeIds.puzzlePlay,
            gameModeParameters: {
                puzzle,
            },
            savegame,
        });
    }

    onEnter(payload) {
        this.selectCategory(lastCategory);

        if (payload && payload.error) {
            this.dialogs.showWarning(payload.error.title, payload.error.desc);
        }

        for (const category of categories) {
            const button = this.htmlElement.querySelector(`[data-category="${category}"]`);
            this.trackClicks(button, () => this.selectCategory(category));
        }

        this.trackClicks(this.htmlElement.querySelector("button.createPuzzle"), () => this.createNewPuzzle());
        this.trackClicks(this.htmlElement.querySelector("button.loadPuzzle"), () => this.loadPuzzle());

        if (G_IS_DEV && globalConfig.debug.testPuzzleMode) {
            // this.createNewPuzzle();
            this.playPuzzle(SAMPLE_PUZZLE);
        }
    }

    createEmptySavegame() {
        return new Savegame(this.app, {
            internalId: "puzzle",
            metaDataRef: {
                internalId: "puzzle",
                lastUpdate: 0,
                version: 0,
                level: 0,
                name: "puzzle",
            },
        });
    }

    loadPuzzle() {
        const shortKeyInput = new FormElementInput({
            id: "shortKey",
            label: null,
            placeholder: "",
            defaultValue: "",
            validator: val => ShapeDefinition.isValidShortKey(val),
        });

        const dialog = new DialogWithForm({
            app: this.app,
            title: T.dialogs.puzzleLoadShortKey.title,
            desc: T.dialogs.puzzleLoadShortKey.desc,
            formElements: [shortKeyInput],
            buttons: ["ok:good:enter"],
        });
        this.dialogs.internalShowDialog(dialog);

        dialog.buttonSignals.ok.add(() => {
            const closeLoading = this.dialogs.showLoadingDialog();

            this.app.clientApi.apiDownloadPuzzleByKey(shortKeyInput.getValue()).then(
                puzzle => {
                    closeLoading();
                    this.startLoadedPuzzle(puzzle);
                },
                err => {
                    closeLoading();
                    this.dialogs.showWarning(
                        T.dialogs.puzzleDownloadError.title,
                        T.dialogs.puzzleDownloadError.desc + " " + err
                    );
                }
            );
        });
    }

    createNewPuzzle(force = false) {
        if (!force && !this.app.clientApi.isLoggedIn()) {
            const signals = this.dialogs.showWarning(
                T.dialogs.puzzleCreateOffline.title,
                T.dialogs.puzzleCreateOffline.desc,
                ["cancel:good", "continue:bad"]
            );
            signals.continue.add(() => this.createNewPuzzle(true));
            return;
        }

        const savegame = this.createEmptySavegame();
        this.moveToState("InGameState", {
            gameModeId: enumGameModeIds.puzzleEdit,
            savegame,
        });
    }
}
