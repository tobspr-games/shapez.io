import { createLogger } from "../core/logging";
import { DialogWithForm } from "../core/modal_dialog_elements";
import { FormElementInput } from "../core/modal_dialog_forms";
import { TextualGameState } from "../core/textual_game_state";
import { formatBigNumberFull } from "../core/utils";
import { enumGameModeIds } from "../game/game_mode";
import { ShapeDefinition } from "../game/shape_definition";
import { MUSIC } from "../platform/sound";
import { Savegame } from "../savegame/savegame";
import { T } from "../translations";

const navigation = {
    categories: ["official", "top-rated", "trending", "trending-weekly", "new"],
    difficulties: ["easy", "medium", "hard"],
    account: ["mine", "completed"],
    search: ["search"],
};

const logger = createLogger("puzzle-menu");

let lastCategory = "official";

let lastSearchOptions = {
    searchTerm: "",
    difficulty: "any",
    duration: "any",
    includeCompleted: false,
};

export class PuzzleMenuState extends TextualGameState {
    constructor() {
        super("PuzzleMenuState");
        this.loading = false;
        this.activeCategory = "";

        /**
         * @type {Array<import("../savegame/savegame_typedefs").PuzzleMetadata>}
         */
        this.puzzles = [];
    }

    getThemeMusic() {
        return MUSIC.puzzle;
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

                    <div class="categories rootCategories">
                    ${Object.keys(navigation)
                        .map(
                            rootCategory =>
                                `<button data-root-category="${rootCategory}" class="styledButton category root">${T.puzzleMenu.categories[rootCategory]}</button>`
                        )
                        .join("")}
                    </div>

                    <div class="categories subCategories">
                    </div>

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

        const categoryElement = this.htmlElement.querySelector(`[data-category="${category}"]`);
        if (categoryElement) {
            categoryElement.classList.add("active");
        }

        const container = this.htmlElement.querySelector("#mainContainer");
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        if (category === "search") {
            this.loading = false;

            this.startSearch();
            return;
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
     * Selects a root category
     * @param {string} rootCategory
     * @param {string=} category
     */
    selectRootCategory(rootCategory, category) {
        const subCategory = category || navigation[rootCategory][0];
        console.warn("Select root category", rootCategory, category, "->", subCategory);

        if (this.loading) {
            return;
        }
        if (this.activeCategory === subCategory) {
            return;
        }

        const activeCategory = this.htmlElement.querySelector(".active[data-root-category]");
        if (activeCategory) {
            activeCategory.classList.remove("active");
        }

        const newActiveCategory = this.htmlElement.querySelector(`[data-root-category="${rootCategory}"]`);
        if (newActiveCategory) {
            newActiveCategory.classList.add("active");
        }

        // Rerender buttons

        const subContainer = this.htmlElement.querySelector(".subCategories");
        while (subContainer.firstChild) {
            subContainer.removeChild(subContainer.firstChild);
        }

        const children = navigation[rootCategory];
        if (children.length > 1) {
            for (const category of children) {
                const button = document.createElement("button");
                button.setAttribute("data-category", category);
                button.classList.add("styledButton", "category", "child");
                button.innerText = T.puzzleMenu.categories[category];
                this.trackClicks(button, () => this.selectCategory(category));
                subContainer.appendChild(button);
            }
        }

        if (rootCategory === "search") {
            this.renderSearchForm(subContainer);
        }

        this.selectCategory(subCategory);
    }

    renderSearchForm(parent) {
        const container = document.createElement("form");
        container.classList.add("searchForm");

        // Search
        const searchField = document.createElement("input");
        searchField.value = lastSearchOptions.searchTerm;
        searchField.classList.add("search");
        searchField.setAttribute("type", "text");
        searchField.setAttribute("placeholder", T.puzzleMenu.search.placeholder);
        searchField.addEventListener("input", () => {
            lastSearchOptions.searchTerm = searchField.value.trim();
        });
        container.appendChild(searchField);

        // Difficulty
        const difficultyFilter = document.createElement("select");
        for (const difficulty of ["any", "easy", "medium", "hard"]) {
            const option = document.createElement("option");
            option.value = difficulty;
            option.innerText = T.puzzleMenu.search.difficulties[difficulty];
            if (option.value === lastSearchOptions.difficulty) {
                option.setAttribute("selected", "selected");
            }
            difficultyFilter.appendChild(option);
        }
        difficultyFilter.addEventListener("change", () => {
            const option = difficultyFilter.value;
            lastSearchOptions.difficulty = option;
        });
        container.appendChild(difficultyFilter);

        // Duration
        const durationFilter = document.createElement("select");
        for (const duration of ["any", "short", "medium", "long"]) {
            const option = document.createElement("option");
            option.value = duration;
            option.innerText = T.puzzleMenu.search.durations[duration];
            if (option.value === lastSearchOptions.duration) {
                option.setAttribute("selected", "selected");
            }
            durationFilter.appendChild(option);
        }
        durationFilter.addEventListener("change", () => {
            const option = durationFilter.value;
            lastSearchOptions.duration = option;
        });
        container.appendChild(durationFilter);

        // Include completed
        const labelCompleted = document.createElement("label");
        labelCompleted.classList.add("filterCompleted");

        const inputCompleted = document.createElement("input");
        inputCompleted.setAttribute("type", "checkbox");
        if (lastSearchOptions.includeCompleted) {
            inputCompleted.setAttribute("checked", "checked");
        }
        inputCompleted.addEventListener("change", () => {
            lastSearchOptions.includeCompleted = inputCompleted.checked;
        });

        labelCompleted.appendChild(inputCompleted);

        const text = document.createTextNode(T.puzzleMenu.search.includeCompleted);
        labelCompleted.appendChild(text);

        container.appendChild(labelCompleted);

        // Submit
        const submitButton = document.createElement("button");
        submitButton.classList.add("styledButton");
        submitButton.setAttribute("type", "submit");
        submitButton.innerText = T.puzzleMenu.search.action;
        container.appendChild(submitButton);

        container.addEventListener("submit", event => {
            event.preventDefault();
            console.log("Search:", searchField.value.trim());
            this.startSearch();
        });

        parent.appendChild(container);
    }

    startSearch() {
        if (this.loading) {
            return;
        }

        this.loading = true;

        const container = this.htmlElement.querySelector("#mainContainer");
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const loadingElement = document.createElement("div");
        loadingElement.classList.add("loader");
        loadingElement.innerText = T.global.loading + "...";
        container.appendChild(loadingElement);

        this.asyncChannel
            .watch(this.app.clientApi.apiSearchPuzzles(lastSearchOptions))
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
        this.puzzles = puzzles;

        const container = this.htmlElement.querySelector("#mainContainer");
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        for (const puzzle of puzzles) {
            const elem = document.createElement("div");
            elem.classList.add("puzzle");
            elem.setAttribute("data-puzzle-id", String(puzzle.id));

            if (this.activeCategory !== "mine") {
                elem.classList.toggle("completed", puzzle.completed);
            }

            if (puzzle.title) {
                const title = document.createElement("div");
                title.classList.add("title");
                title.innerText = puzzle.title;
                elem.appendChild(title);
            }

            if (puzzle.author && !["official", "mine"].includes(this.activeCategory)) {
                const author = document.createElement("div");
                author.classList.add("author");
                author.innerText = "by " + puzzle.author;
                elem.appendChild(author);
            }

            const stats = document.createElement("div");
            stats.classList.add("stats");
            elem.appendChild(stats);

            if (!["official", "easy", "medium", "hard"].includes(this.activeCategory)) {
                const difficulty = document.createElement("div");
                difficulty.classList.add("difficulty");

                const completionPercentage = Math.max(
                    0,
                    Math.min(100, Math.round((puzzle.completions / puzzle.downloads) * 100.0))
                );
                difficulty.innerText = completionPercentage + "%";
                stats.appendChild(difficulty);

                if (puzzle.difficulty === null) {
                    difficulty.classList.add("stage--unknown");
                    difficulty.innerText = T.puzzleMenu.difficulties.unknown;
                } else if (puzzle.difficulty < 0.2) {
                    difficulty.classList.add("stage--easy");
                    difficulty.innerText = T.puzzleMenu.difficulties.easy;
                } else if (puzzle.difficulty > 0.6) {
                    difficulty.classList.add("stage--hard");
                    difficulty.innerText = T.puzzleMenu.difficulties.hard;
                } else {
                    difficulty.classList.add("stage--medium");
                    difficulty.innerText = T.puzzleMenu.difficulties.medium;
                }
            }

            if (this.activeCategory === "mine") {
                const downloads = document.createElement("div");
                downloads.classList.add("downloads");
                downloads.innerText = String(puzzle.downloads);
                stats.appendChild(downloads);
                stats.classList.add("withDownloads");
            }

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

            if (this.activeCategory === "mine") {
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("styledButton", "delete");
                this.trackClicks(
                    deleteButton,
                    () => {
                        this.tryDeletePuzzle(puzzle);
                    },
                    {
                        consumeEvents: true,
                        preventClick: true,
                        preventDefault: true,
                    }
                );
                elem.appendChild(deleteButton);
            }

            container.appendChild(elem);

            this.trackClicks(elem, () => this.playPuzzle(puzzle.id));
        }

        if (puzzles.length === 0) {
            const elem = document.createElement("div");
            elem.classList.add("empty");
            elem.innerText = T.puzzleMenu.noPuzzles;
            container.appendChild(elem);
        }
    }

    /**
     * @param {import("../savegame/savegame_typedefs").PuzzleMetadata} puzzle
     */
    tryDeletePuzzle(puzzle) {
        const signals = this.dialogs.showWarning(
            T.dialogs.puzzleDelete.title,
            T.dialogs.puzzleDelete.desc.replace("<title>", puzzle.title),
            ["delete:bad", "cancel:good"]
        );
        signals.delete.add(() => {
            const closeLoading = this.dialogs.showLoadingDialog();

            this.asyncChannel
                .watch(this.app.clientApi.apiDeletePuzzle(puzzle.id))
                .then(() => {
                    const element = this.htmlElement.querySelector("[data-puzzle-id='" + puzzle.id + "']");
                    if (element) {
                        element.remove();
                    }
                })
                .catch(err => {
                    this.dialogs.showWarning(T.global.error, String(err));
                })
                .then(closeLoading);
        });
    }

    /**
     *
     * @param {*} category
     * @returns {Promise<import("../savegame/savegame_typedefs").PuzzleMetadata[]>}
     */
    getPuzzlesForCategory(category) {
        const result = this.app.clientApi.apiListPuzzles(category);
        return result.catch(err => {
            logger.error("Failed to get", category, ":", err);
            throw err;
        });
    }

    /**
     *
     * @param {number} puzzleId
     * @param {Array<number>=} nextPuzzles
     */
    playPuzzle(puzzleId, nextPuzzles) {
        const closeLoading = this.dialogs.showLoadingDialog();

        this.asyncChannel.watch(this.app.clientApi.apiDownloadPuzzle(puzzleId)).then(
            puzzleData => {
                closeLoading();

                nextPuzzles =
                    nextPuzzles || this.puzzles.filter(puzzle => !puzzle.completed).map(puzzle => puzzle.id);
                nextPuzzles = nextPuzzles.filter(id => id !== puzzleId);

                logger.log("Got puzzle:", puzzleData, "next puzzles:", nextPuzzles);
                this.startLoadedPuzzle(puzzleData, nextPuzzles);
            },
            err => {
                closeLoading();
                logger.error("Failed to download puzzle", puzzleId, ":", err);
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
     * @param {Array<number>=} nextPuzzles
     */
    startLoadedPuzzle(puzzle, nextPuzzles) {
        const savegame = Savegame.createPuzzleSavegame(this.app);
        this.moveToState("InGameState", {
            gameModeId: enumGameModeIds.puzzlePlay,
            gameModeParameters: {
                puzzle,
                nextPuzzles,
            },
            savegame,
        });
    }

    onEnter(payload) {
        if (payload.continueQueue) {
            logger.log("Continuing puzzle queue:", payload);
            this.playPuzzle(payload.continueQueue[0], payload.continueQueue.slice(1));
        }

        // Find old category
        let rootCategory = "categories";
        for (const [id, children] of Object.entries(navigation)) {
            if (children.includes(lastCategory)) {
                rootCategory = id;
                break;
            }
        }

        this.selectRootCategory(rootCategory, lastCategory);

        if (payload && payload.error) {
            this.dialogs.showWarning(payload.error.title, payload.error.desc);
        }

        for (const rootCategory of Object.keys(navigation)) {
            const button = this.htmlElement.querySelector(`[data-root-category="${rootCategory}"]`);
            this.trackClicks(button, () => this.selectRootCategory(rootCategory));
        }

        this.trackClicks(this.htmlElement.querySelector("button.createPuzzle"), () => this.createNewPuzzle());
        this.trackClicks(this.htmlElement.querySelector("button.loadPuzzle"), () => this.loadPuzzle());
    }

    loadPuzzle() {
        const shortKeyInput = new FormElementInput({
            id: "shortKey",
            label: null,
            placeholder: "",
            defaultValue: "",
            validator: val => ShapeDefinition.isValidShortKey(val) || val.startsWith("/"),
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
            const searchTerm = shortKeyInput.getValue();

            if (searchTerm === "/apikey") {
                alert("Your api key is: " + this.app.clientApi.token);
                return;
            }

            const closeLoading = this.dialogs.showLoadingDialog();

            this.app.clientApi.apiDownloadPuzzleByKey(searchTerm).then(
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

        const savegame = Savegame.createPuzzleSavegame(this.app);
        this.moveToState("InGameState", {
            gameModeId: enumGameModeIds.puzzleEdit,
            savegame,
        });
    }
}
