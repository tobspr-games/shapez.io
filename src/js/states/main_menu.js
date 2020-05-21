import { GameState } from "../core/game_state";
import { cachebust } from "../core/cachebust";
import { globalConfig, IS_DEBUG, IS_DEMO, THIRDPARTY_URLS } from "../core/config";
import {
    makeDiv,
    formatSecondsToTimeAgo,
    generateFileDownload,
    waitNextFrame,
    isSupportedBrowser,
} from "../core/utils";
import { ReadWriteProxy } from "../core/read_write_proxy";
import { HUDModalDialogs } from "../game/hud/parts/modal_dialogs";
import { T } from "../translations";

export class MainMenuState extends GameState {
    constructor() {
        super("MainMenuState");
    }

    getInnerHTML() {
        const bannerHtml = `
            <h3>${T.demoBanners.title}</h3>
            
            <p>${T.demoBanners.intro}</p>

            <ul>
                ${T.demoBanners.advantages.map(advantage => `<li>${advantage}</li>`).join("")}
            </ul>

            <a href="#" class="steamLink" target="_blank">Get the shapez.io standalone!</a>
        `;

        return `

            <button class="settingsButton"></button>
            
        ${
            G_IS_STANDALONE
                ? `
            <button class="exitAppButton"></button>
        `
                : ""
        }

            ${
                G_IS_STANDALONE
                    ? ""
                    : `<video autoplay muted loop class="fullscreenBackgroundVideo">
                <source src="${cachebust("res/bg_render.webm")}" type="video/webm">
            </video>`
            }


            <div class="logo">
                <img src="${cachebust("res/logo.png")}" alt="shapez.io Logo">
                ${IS_DEMO ? `<div class="demoBadge"></div>` : ""}
            </div>


            <div class="mainWrapper ${IS_DEMO ? "demo" : "noDemo"}">
            
                ${IS_DEMO ? `<div class="standaloneBanner">${bannerHtml}</div>` : ""}    
                
                <div class="mainContainer">
                    ${
                        isSupportedBrowser()
                            ? ""
                            : `<div class="browserWarning">${T.mainMenu.browserWarning}</div>`
                    }
                    <button class="playButton styledButton">${T.mainMenu.play}</button>
                    <button class="importButton styledButton">${T.mainMenu.importSavegame}</button>
                </div>
                
    
            </div>

            <div class="footer">

                <a href="${THIRDPARTY_URLS.github}" target="_blank">
                    ${T.mainMenu.openSourceHint}
                    <span class="thirdpartyLogo githubLogo"></span>
                    </a>    
                    
                <a href="${THIRDPARTY_URLS.discord}" target="_blank">
                    ${T.mainMenu.discordLink}
                    <span class="thirdpartyLogo  discordLogo"></span>
                </a>    

                ${
                    G_IS_BROWSER
                        ? `<a class="iogLink" target="_blank" href="https://iogames.space">More .io games</a>`
                        : ""
                }

                <div class="author">Made by <a href="https://tobspr.com" target="_blank">Tobias Springer</a></div>

            </div>
        `;
    }

    requestImportSavegame() {
        if (IS_DEMO && this.app.savegameMgr.getSavegamesMetaData().length > 0) {
            this.dialogs.showWarning(T.dialogs.oneSavegameLimit.title, T.dialogs.oneSavegameLimit.desc);
            return;
        }

        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".bin";

        input.onchange = e => {
            const file = input.files[0];
            if (file) {
                waitNextFrame().then(() => {
                    this.app.analytics.trackUiClick("import_savegame");
                    const closeLoader = this.dialogs.showLoadingDialog();
                    const reader = new FileReader();
                    reader.addEventListener("load", event => {
                        const contents = event.target.result;
                        let realContent;

                        try {
                            realContent = ReadWriteProxy.deserializeObject(contents);
                        } catch (err) {
                            closeLoader();
                            this.dialogs.showWarning(
                                T.dialogs.importSavegameError.title,
                                T.dialogs.importSavegameError.text + "<br><br>" + err
                            );
                            return;
                        }

                        this.app.savegameMgr.importSavegame(realContent).then(
                            () => {
                                closeLoader();
                                this.dialogs.showWarning(
                                    T.dialogs.importSavegameSuccess.title,
                                    T.dialogs.importSavegameSuccess.text
                                );

                                this.renderSavegames();
                            },
                            err => {
                                closeLoader();
                                this.dialogs.showWarning(
                                    T.dialogs.importSavegameError.title,
                                    T.dialogs.importSavegameError.text + ":<br><br>" + err
                                );
                            }
                        );
                    });
                    reader.addEventListener("error", error => {
                        this.dialogs.showWarning(
                            T.dialogs.importSavegameError.title,
                            T.dialogs.importSavegameError.text + ":<br><br>" + error
                        );
                    });
                    reader.readAsText(file, "utf-8");
                });
            }
        };
        input.click();
    }

    onBackButton() {
        this.app.platformWrapper.exitApp();
    }

    onEnter(payload) {
        if (payload.loadError) {
            this.dialogs.showWarning(
                T.dialogs.gameLoadFailure.title,
                T.dialogs.gameLoadFailure.text + "<br><br>" + payload.loadError
            );
        }

        this.dialogs = new HUDModalDialogs(null, this.app);
        const dialogsElement = document.body.querySelector(".modalDialogParent");
        this.dialogs.initializeToElement(dialogsElement);

        const qs = this.htmlElement.querySelector.bind(this.htmlElement);
        this.trackClicks(qs(".mainContainer .playButton"), this.onPlayButtonClicked);
        this.trackClicks(qs(".mainContainer .importButton"), this.requestImportSavegame);

        if (G_IS_DEV && globalConfig.debug.fastGameEnter) {
            const games = this.app.savegameMgr.getSavegamesMetaData();
            if (games.length > 0) {
                this.resumeGame(games[0]);
            } else {
                this.onPlayButtonClicked();
            }
        }

        // Initialize video
        this.videoElement = this.htmlElement.querySelector("video");
        if (this.videoElement) {
            this.videoElement.playbackRate = 0.9;
            this.videoElement.addEventListener("canplay", () => {
                if (this.videoElement) {
                    this.videoElement.classList.add("loaded");
                }
            });
        }

        this.trackClicks(qs(".settingsButton"), this.onSettingsButtonClicked);

        if (G_IS_STANDALONE) {
            this.trackClicks(qs(".exitAppButton"), this.onExitAppButtonClicked);
        }

        this.renderSavegames();

        const steamLinks = this.htmlElement.querySelectorAll(".steamLink");
        steamLinks.forEach(steamLink => {
            steamLink.addEventListener("click", this.onSteamLinkClicked.bind(this));
        });
    }

    onSteamLinkClicked(event) {
        this.app.analytics.trackUiClick("main_menu_steam_link");
        window.open(THIRDPARTY_URLS.standaloneStorePage);
        event.preventDefault();
        return false;
    }

    onExitAppButtonClicked() {
        this.app.platformWrapper.exitApp();
    }

    renderSavegames() {
        const oldContainer = this.htmlElement.querySelector(".mainContainer .savegames");
        if (oldContainer) {
            oldContainer.remove();
        }
        const games = this.app.savegameMgr.getSavegamesMetaData();
        if (games.length > 0) {
            const parent = makeDiv(this.htmlElement.querySelector(".mainContainer"), null, ["savegames"]);

            for (let i = 0; i < games.length; ++i) {
                const elem = makeDiv(parent, null, ["savegame"]);

                makeDiv(elem, null, ["internalId"], games[i].internalId.substr(0, 6));
                makeDiv(
                    elem,
                    null,
                    ["updateTime"],
                    formatSecondsToTimeAgo((new Date().getTime() - games[i].lastUpdate) / 1000.0)
                );

                const deleteButton = document.createElement("button");
                deleteButton.classList.add("styledButton", "deleteGame");
                elem.appendChild(deleteButton);

                const downloadButton = document.createElement("button");
                downloadButton.classList.add("styledButton", "downloadGame");
                elem.appendChild(downloadButton);

                const resumeBtn = document.createElement("button");
                resumeBtn.classList.add("styledButton", "resumeGame");
                elem.appendChild(resumeBtn);

                this.trackClicks(deleteButton, () => this.deleteGame(games[i]));
                this.trackClicks(downloadButton, () => this.downloadGame(games[i]));
                this.trackClicks(resumeBtn, () => this.resumeGame(games[i]));
            }
        }
    }

    /**
     * @param {object} game
     */
    resumeGame(game) {
        this.app.analytics.trackUiClick("resume_game");

        // if (IS_DEMO) {
        //     this.dialogs.showFeatureRestrictionInfo(T.demo.features.restoringGames);
        //     return;
        // }

        const savegame = this.app.savegameMgr.getSavegameById(game.internalId);
        savegame.readAsync().then(() => {
            this.moveToState("InGameState", {
                savegame,
            });
        });
    }

    /**
     * @param {object} game
     */
    deleteGame(game) {
        const signals = this.dialogs.showWarning(
            T.dialogs.confirmSavegameDelete.title,
            T.dialogs.confirmSavegameDelete.text,
            ["delete:bad", "cancel:good"]
        );

        signals.delete.add(() => {
            this.app.savegameMgr.deleteSavegame(game).then(
                () => {
                    this.renderSavegames();
                },
                err => {
                    this.dialogs.showWarning(
                        T.dialogs.savegameDeletionError.title,
                        T.dialogs.savegameDeletionError.text + "<br><br>" + err
                    );
                }
            );
        });
    }

    /**
     * @param {object} game
     */
    downloadGame(game) {
        this.app.analytics.trackUiClick("download_game");

        const savegame = this.app.savegameMgr.getSavegameById(game.internalId);
        savegame.readAsync().then(() => {
            const data = ReadWriteProxy.serializeObject(savegame.currentData);
            generateFileDownload(savegame.filename, data);
        });
    }

    onSettingsButtonClicked() {
        this.moveToState("SettingsState");
    }

    doStartNewGame() {
        this.app.analytics.trackUiClick("startgame");
        const savegame = this.app.savegameMgr.createNewSavegame();

        this.moveToState("InGameState", {
            savegame,
        });
    }

    onPlayButtonClicked() {
        if (IS_DEMO && this.app.savegameMgr.getSavegamesMetaData().length > 0) {
            this.dialogs.showWarning(T.dialogs.oneSavegameLimit.title, T.dialogs.oneSavegameLimit.desc);
            return;
        }

        if (IS_DEMO) {
            const { ok } = this.dialogs.showWarning(
                T.dialogs.demoExplanation.title,
                T.dialogs.demoExplanation.desc
            );
            ok.add(() => this.doStartNewGame());
            return;
        }

        this.doStartNewGame();
    }

    onLeave() {
        this.dialogs.cleanup();
    }
}
