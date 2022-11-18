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
const navigation: any = {
    categories: ["official", "top-rated", "trending", "trending-weekly", "new"],
    difficulties: ["easy", "medium", "hard"],
    account: ["mine", "completed"],
    search: ["search"],
};
const logger: any = createLogger("puzzle-menu");
let lastCategory: any = "official";
let lastSearchOptions: any = {
    searchTerm: "",
    difficulty: "any",
    duration: "any",
    includeCompleted: false,
};
export class PuzzleMenuState extends TextualGameState {
    public loading = false;
    public activeCategory = "";
    public puzzles: Array<import("../savegame/savegame_typedefs").PuzzleMetadata> = [];

    constructor() {
        super("PuzzleMenuState");
    }
    getThemeMusic(): any {
        return MUSIC.puzzle;
    }
    getStateHeaderTitle(): any {
        return T.puzzleMenu.title;
    }
    /**
     * Overrides the GameState implementation to provide our own html
     */
    internalGetFullHtml(): any {
        let headerHtml: any = `
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
    getMainContentHTML(): any {
        let html: any = `
                <div class="categoryChooser">

                    <div class="categories rootCategories">
                    ${Object.keys(navigation)
            .map((rootCategory: any): any => `<button data-root-category="${rootCategory}" class="styledButton category root">${T.puzzleMenu.categories[rootCategory]}</button>`)
            .join("")}
                    </div>

                    <div class="categories subCategories">
                    </div>

                </div>


                <div class="puzzles" id="mainContainer"></div>
        `;
        return html;
    }
    selectCategory(category: any): any {
        lastCategory = category;
        if (category === this.activeCategory) {
            return;
        }
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.activeCategory = category;
        const activeCategory: any = this.htmlElement.querySelector(".active[data-category]");
        if (activeCategory) {
            activeCategory.classList.remove("active");
        }
        const categoryElement: any = this.htmlElement.querySelector(`[data-category="${category}"]`);
        if (categoryElement) {
            categoryElement.classList.add("active");
        }
        const container: any = this.htmlElement.querySelector("#mainContainer");
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        if (category === "search") {
            this.loading = false;
            this.startSearch();
            return;
        }
        const loadingElement: any = document.createElement("div");
        loadingElement.classList.add("loader");
        loadingElement.innerText = T.global.loading + "...";
        container.appendChild(loadingElement);
        this.asyncChannel
            .watch(this.getPuzzlesForCategory(category))
            .then((puzzles: any): any => this.renderPuzzles(puzzles), (error: any): any => {
            this.dialogs.showWarning(T.dialogs.puzzleLoadFailed.title, T.dialogs.puzzleLoadFailed.desc + " " + error);
            this.renderPuzzles([]);
        })
            .then((): any => (this.loading = false));
    }
    /**
     * Selects a root category
     */
    selectRootCategory(rootCategory: string, category: string=): any {
        const subCategory: any = category || navigation[rootCategory][0];
        console.warn("Select root category", rootCategory, category, "->", subCategory);
        if (this.loading) {
            return;
        }
        if (this.activeCategory === subCategory) {
            return;
        }
        const activeCategory: any = this.htmlElement.querySelector(".active[data-root-category]");
        if (activeCategory) {
            activeCategory.classList.remove("active");
        }
        const newActiveCategory: any = this.htmlElement.querySelector(`[data-root-category="${rootCategory}"]`);
        if (newActiveCategory) {
            newActiveCategory.classList.add("active");
        }
        // Rerender buttons
        const subContainer: any = this.htmlElement.querySelector(".subCategories");
        while (subContainer.firstChild) {
            subContainer.removeChild(subContainer.firstChild);
        }
        const children: any = navigation[rootCategory];
        if (children.length > 1) {
            for (const category: any of children) {
                const button: any = document.createElement("button");
                button.setAttribute("data-category", category);
                button.classList.add("styledButton", "category", "child");
                button.innerText = T.puzzleMenu.categories[category];
                this.trackClicks(button, (): any => this.selectCategory(category));
                subContainer.appendChild(button);
            }
        }
        if (rootCategory === "search") {
            this.renderSearchForm(subContainer);
        }
        this.selectCategory(subCategory);
    }
    renderSearchForm(parent: any): any {
        const container: any = document.createElement("form");
        container.classList.add("searchForm");
        // Search
        const searchField: any = document.createElement("input");
        searchField.value = lastSearchOptions.searchTerm;
        searchField.classList.add("search");
        searchField.setAttribute("type", "text");
        searchField.setAttribute("placeholder", T.puzzleMenu.search.placeholder);
        searchField.addEventListener("input", (): any => {
            lastSearchOptions.searchTerm = searchField.value.trim();
        });
        container.appendChild(searchField);
        // Difficulty
        const difficultyFilter: any = document.createElement("select");
        for (const difficulty: any of ["any", "easy", "medium", "hard"]) {
            const option: any = document.createElement("option");
            option.value = difficulty;
            option.innerText = T.puzzleMenu.search.difficulties[difficulty];
            if (option.value === lastSearchOptions.difficulty) {
                option.setAttribute("selected", "selected");
            }
            difficultyFilter.appendChild(option);
        }
        difficultyFilter.addEventListener("change", (): any => {
            const option: any = difficultyFilter.value;
            lastSearchOptions.difficulty = option;
        });
        container.appendChild(difficultyFilter);
        // Duration
        const durationFilter: any = document.createElement("select");
        for (const duration: any of ["any", "short", "medium", "long"]) {
            const option: any = document.createElement("option");
            option.value = duration;
            option.innerText = T.puzzleMenu.search.durations[duration];
            if (option.value === lastSearchOptions.duration) {
                option.setAttribute("selected", "selected");
            }
            durationFilter.appendChild(option);
        }
        durationFilter.addEventListener("change", (): any => {
            const option: any = durationFilter.value;
            lastSearchOptions.duration = option;
        });
        container.appendChild(durationFilter);
        // Include completed
        const labelCompleted: any = document.createElement("label");
        labelCompleted.classList.add("filterCompleted");
        const inputCompleted: any = document.createElement("input");
        inputCompleted.setAttribute("type", "checkbox");
        if (lastSearchOptions.includeCompleted) {
            inputCompleted.setAttribute("checked", "checked");
        }
        inputCompleted.addEventListener("change", (): any => {
            lastSearchOptions.includeCompleted = inputCompleted.checked;
        });
        labelCompleted.appendChild(inputCompleted);
        const text: any = document.createTextNode(T.puzzleMenu.search.includeCompleted);
        labelCompleted.appendChild(text);
        container.appendChild(labelCompleted);
        // Submit
        const submitButton: any = document.createElement("button");
        submitButton.classList.add("styledButton");
        submitButton.setAttribute("type", "submit");
        submitButton.innerText = T.puzzleMenu.search.action;
        container.appendChild(submitButton);
        container.addEventListener("submit", (event: any): any => {
            event.preventDefault();
            console.log("Search:", searchField.value.trim());
            this.startSearch();
        });
        parent.appendChild(container);
    }
    startSearch(): any {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const container: any = this.htmlElement.querySelector("#mainContainer");
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        const loadingElement: any = document.createElement("div");
        loadingElement.classList.add("loader");
        loadingElement.innerText = T.global.loading + "...";
        container.appendChild(loadingElement);
        this.asyncChannel
            .watch(this.app.clientApi.apiSearchPuzzles(lastSearchOptions))
            .then((puzzles: any): any => this.renderPuzzles(puzzles), (error: any): any => {
            this.dialogs.showWarning(T.dialogs.puzzleLoadFailed.title, T.dialogs.puzzleLoadFailed.desc + " " + error);
            this.renderPuzzles([]);
        })
            .then((): any => (this.loading = false));
    }
    
    renderPuzzles(puzzles: import("../savegame/savegame_typedefs").PuzzleMetadata[]): any {
        this.puzzles = puzzles;
        const container: any = this.htmlElement.querySelector("#mainContainer");
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        for (const puzzle: any of puzzles) {
            const elem: any = document.createElement("div");
            elem.classList.add("puzzle");
            elem.setAttribute("data-puzzle-id", String(puzzle.id));
            if (this.activeCategory !== "mine") {
                elem.classList.toggle("completed", puzzle.completed);
            }
            if (puzzle.title) {
                const title: any = document.createElement("div");
                title.classList.add("title");
                title.innerText = puzzle.title;
                elem.appendChild(title);
            }
            if (puzzle.author && !["official", "mine"].includes(this.activeCategory)) {
                const author: any = document.createElement("div");
                author.classList.add("author");
                author.innerText = "by " + puzzle.author;
                elem.appendChild(author);
            }
            const stats: any = document.createElement("div");
            stats.classList.add("stats");
            elem.appendChild(stats);
            if (!["official", "easy", "medium", "hard"].includes(this.activeCategory)) {
                const difficulty: any = document.createElement("div");
                difficulty.classList.add("difficulty");
                const completionPercentage: any = Math.max(0, Math.min(100, Math.round((puzzle.completions / puzzle.downloads) * 100.0)));
                difficulty.innerText = completionPercentage + "%";
                stats.appendChild(difficulty);
                if (puzzle.difficulty === null) {
                    difficulty.classList.add("stage--unknown");
                    difficulty.innerText = T.puzzleMenu.difficulties.unknown;
                }
                else if (puzzle.difficulty < 0.2) {
                    difficulty.classList.add("stage--easy");
                    difficulty.innerText = T.puzzleMenu.difficulties.easy;
                }
                else if (puzzle.difficulty > 0.6) {
                    difficulty.classList.add("stage--hard");
                    difficulty.innerText = T.puzzleMenu.difficulties.hard;
                }
                else {
                    difficulty.classList.add("stage--medium");
                    difficulty.innerText = T.puzzleMenu.difficulties.medium;
                }
            }
            if (this.activeCategory === "mine") {
                const downloads: any = document.createElement("div");
                downloads.classList.add("downloads");
                downloads.innerText = String(puzzle.downloads);
                stats.appendChild(downloads);
                stats.classList.add("withDownloads");
            }
            const likes: any = document.createElement("div");
            likes.classList.add("likes");
            likes.innerText = formatBigNumberFull(puzzle.likes);
            stats.appendChild(likes);
            const definition: any = ShapeDefinition.fromShortKey(puzzle.shortKey);
            const canvas: any = definition.generateAsCanvas(100 * this.app.getEffectiveUiScale());
            const icon: any = document.createElement("div");
            icon.classList.add("icon");
            icon.appendChild(canvas);
            elem.appendChild(icon);
            if (this.activeCategory === "mine") {
                const deleteButton: any = document.createElement("button");
                deleteButton.classList.add("styledButton", "delete");
                this.trackClicks(deleteButton, (): any => {
                    this.tryDeletePuzzle(puzzle);
                }, {
                    consumeEvents: true,
                    preventClick: true,
                    preventDefault: true,
                });
                elem.appendChild(deleteButton);
            }
            container.appendChild(elem);
            this.trackClicks(elem, (): any => this.playPuzzle(puzzle.id));
        }
        if (puzzles.length === 0) {
            const elem: any = document.createElement("div");
            elem.classList.add("empty");
            elem.innerText = T.puzzleMenu.noPuzzles;
            container.appendChild(elem);
        }
    }
    
    tryDeletePuzzle(puzzle: import("../savegame/savegame_typedefs").PuzzleMetadata): any {
        const signals: any = this.dialogs.showWarning(T.dialogs.puzzleDelete.title, T.dialogs.puzzleDelete.desc.replace("<title>", puzzle.title), ["delete:bad", "cancel:good"]);
        signals.delete.add((): any => {
            const closeLoading: any = this.dialogs.showLoadingDialog();
            this.asyncChannel
                .watch(this.app.clientApi.apiDeletePuzzle(puzzle.id))
                .then((): any => {
                const element: any = this.htmlElement.querySelector("[data-puzzle-id='" + puzzle.id + "']");
                if (element) {
                    element.remove();
                }
            })
                .catch((err: any): any => {
                this.dialogs.showWarning(T.global.error, String(err));
            })
                .then(closeLoading);
        });
    }
    category: *): Promise<import("../savegame/savegame_typedefs").PuzzleMetadata[]> {
        const result: any = this.app.clientApi.apiListPuzzles(category);
        return result.catch((err: any): any => {
            logger.error("Failed to get", category, ":", err);
            throw err;
        });
    }
        playPuzzle(puzzleId: number, nextPuzzles: Array<number>=): any {
        const closeLoading: any = this.dialogs.showLoadingDialog();
        this.asyncChannel.watch(this.app.clientApi.apiDownloadPuzzle(puzzleId)).then((puzzleData: any): any => {
            closeLoading();
            nextPuzzles =
                nextPuzzles || this.puzzles.filter((puzzle: any): any => !puzzle.completed).map((puzzle: any): any => puzzle.id);
            nextPuzzles = nextPuzzles.filter((id: any): any => id !== puzzleId);
            logger.log("Got puzzle:", puzzleData, "next puzzles:", nextPuzzles);
            this.startLoadedPuzzle(puzzleData, nextPuzzles);
        }, (err: any): any => {
            closeLoading();
            logger.error("Failed to download puzzle", puzzleId, ":", err);
            this.dialogs.showWarning(T.dialogs.puzzleDownloadError.title, T.dialogs.puzzleDownloadError.desc + " " + err);
        });
    }
    
    startLoadedPuzzle(puzzle: import("../savegame/savegame_typedefs").PuzzleFullData, nextPuzzles: Array<number>=): any {
        const savegame: any = Savegame.createPuzzleSavegame(this.app);
        this.moveToState("InGameState", {
            gameModeId: enumGameModeIds.puzzlePlay,
            gameModeParameters: {
                puzzle,
                nextPuzzles,
            },
            savegame,
        });
    }
    onEnter(payload: any): any {
        if (payload.continueQueue) {
            logger.log("Continuing puzzle queue:", payload);
            this.playPuzzle(payload.continueQueue[0], payload.continueQueue.slice(1));
        }
        // Find old category
        let rootCategory: any = "categories";
        for (const [id, children]: any of Object.entries(navigation)) {
            if (children.includes(lastCategory)) {
                rootCategory = id;
                break;
            }
        }
        this.selectRootCategory(rootCategory, lastCategory);
        if (payload && payload.error) {
            this.dialogs.showWarning(payload.error.title, payload.error.desc);
        }
        for (const rootCategory: any of Object.keys(navigation)) {
            const button: any = this.htmlElement.querySelector(`[data-root-category="${rootCategory}"]`);
            this.trackClicks(button, (): any => this.selectRootCategory(rootCategory));
        }
        this.trackClicks(this.htmlElement.querySelector("button.createPuzzle"), (): any => this.createNewPuzzle());
        this.trackClicks(this.htmlElement.querySelector("button.loadPuzzle"), (): any => this.loadPuzzle());
    }
    loadPuzzle(): any {
        const shortKeyInput: any = new FormElementInput({
            id: "shortKey",
            label: null,
            placeholder: "",
            defaultValue: "",
            validator: (val: any): any => ShapeDefinition.isValidShortKey(val) || val.startsWith("/"),
        });
        const dialog: any = new DialogWithForm({
            app: this.app,
            title: T.dialogs.puzzleLoadShortKey.title,
            desc: T.dialogs.puzzleLoadShortKey.desc,
            formElements: [shortKeyInput],
            buttons: ["ok:good:enter"],
        });
        this.dialogs.internalShowDialog(dialog);
        dialog.buttonSignals.ok.add((): any => {
            const searchTerm: any = shortKeyInput.getValue();
            if (searchTerm === "/apikey") {
                alert("Your api key is: " + this.app.clientApi.token);
                return;
            }
            const closeLoading: any = this.dialogs.showLoadingDialog();
            this.app.clientApi.apiDownloadPuzzleByKey(searchTerm).then((puzzle: any): any => {
                closeLoading();
                this.startLoadedPuzzle(puzzle);
            }, (err: any): any => {
                closeLoading();
                this.dialogs.showWarning(T.dialogs.puzzleDownloadError.title, T.dialogs.puzzleDownloadError.desc + " " + err);
            });
        });
    }
    createNewPuzzle(force: any = false): any {
        if (!force && !this.app.clientApi.isLoggedIn()) {
            const signals: any = this.dialogs.showWarning(T.dialogs.puzzleCreateOffline.title, T.dialogs.puzzleCreateOffline.desc, ["cancel:good", "continue:bad"]);
            signals.continue.add((): any => this.createNewPuzzle(true));
            return;
        }
        const savegame: any = Savegame.createPuzzleSavegame(this.app);
        this.moveToState("InGameState", {
            gameModeId: enumGameModeIds.puzzleEdit,
            savegame,
        });
    }
}
