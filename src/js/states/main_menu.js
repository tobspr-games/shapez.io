import { GameState } from "../core/game_state";
import { cachebust } from "../core/cachebust";
import { globalConfig } from "../core/config";
import {
    makeDiv,
    formatSecondsToTimeAgo,
    generateFileDownload,
    removeAllChildren,
    waitNextFrame,
} from "../core/utils";
import { ReadWriteProxy } from "../core/read_write_proxy";
import { HUDModalDialogs } from "../game/hud/parts/modal_dialogs";

export class MainMenuState extends GameState {
    constructor() {
        super("MainMenuState");
    }

    getInnerHTML() {
        const bannerHtml = `
            <h3>This is a Demo Version</h3>
            
            <p>Get <strong>shapez.io on steam</strong> for:</p>

            <ul>
                <li>No advertisements and demo banners.</li>
                <li>Unlimited savegame slots.</li>
                <li>Supporting the developer ❤️</li>
            </ul>

            <a href="https://steam.shapez.io" class="steamLink" target="_blank">Get shapez.io on steam!</a>
        `;

        return `

            <video autoplay muted loop class="fullscreenBackgroundVideo">
                <source src="${cachebust("res/bg_render.webm")}" type="video/webm">
            </video>


            <div class="logo">
                <img src="${cachebust("res/logo.png")}" alt="shapez.io Logo">

                ${
                    G_IS_STANDALONE
                        ? ""
                        : `
                    <div class="demoBadge"></div>
                `
                }
            </div>


            <div class="mainWrapper">
            
            ${
                G_IS_STANDALONE
                    ? ""
                    : `
                <div class="standaloneBanner leftSide">${bannerHtml}</div>
            `
            }    
                <div class="mainContainer">
                    <button class="playButton styledButton">Play</button>
                    <button class="importButton styledButton">Import savegame</button>
                </div>

                ${
                    G_IS_STANDALONE
                        ? ""
                        : `
                    <div class="standaloneBanner rightSide">${bannerHtml}</div>
                `
                }    
    
            </div>

            <div class="footer">

                <a href="https://github.com/tobspr/shapez.io" target="_blank">
                    This game is open source!
                    <span class="thirdpartyLogo githubLogo"></span>
                </a>    

                <a href="https://discord.gg/HN7EVzV" target="_blank">
                Official discord server
                <span class="thirdpartyLogo  discordLogo"></span>
                </a>    

            </div>
        `;
    }

    requestImportSavegame() {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".bin";

        input.onchange = e => {
            const file = input.files[0];
            if (file) {
                waitNextFrame().then(() => {
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
                                "Import error",
                                "Failed to import your savegame:<br><br>" + err
                            );
                            return;
                        }

                        this.app.savegameMgr.importSavegame(realContent).then(
                            () => {
                                closeLoader();
                                this.dialogs.showWarning("Imported", "Your savegame has been imported.");

                                this.renderSavegames();
                            },
                            err => {
                                closeLoader();
                                this.dialogs.showWarning(
                                    "Import error",
                                    "Failed to import savegame. Please check the console output."
                                );
                            }
                        );
                    });
                    reader.addEventListener("error", error => {
                        console.error(error);
                        alert("Failed to read file: " + error);
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
            alert("Error while loading game: " + payload.loadError);
        }

        this.dialogs = new HUDModalDialogs(null, this.app);
        const dialogsElement = document.body.querySelector(".modalDialogParent");
        this.dialogs.initializeToElement(dialogsElement);

        const qs = this.htmlElement.querySelector.bind(this.htmlElement);
        this.trackClicks(qs(".mainContainer .playButton"), this.onPlayButtonClicked);
        this.trackClicks(qs(".mainContainer .importButton"), this.requestImportSavegame);

        if (G_IS_DEV && globalConfig.debug.fastGameEnter) {
            this.onPlayButtonClicked();
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

        this.renderSavegames();
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
            "Confirm Deletion",
            "Are you sure you want to delete the game?",
            ["delete:bad", "cancel:good"]
        );

        signals.delete.add(() => {
            this.app.savegameMgr.deleteSavegame(game).then(
                () => {
                    this.renderSavegames();
                },
                err => {
                    this.dialogs.showWarning("Failed to delete", "Error: " + err);
                }
            );
        });
    }

    /**
     * @param {object} game
     */
    downloadGame(game) {
        const savegame = this.app.savegameMgr.getSavegameById(game.internalId);
        savegame.readAsync().then(() => {
            const data = ReadWriteProxy.serializeObject(savegame.currentData);
            generateFileDownload(savegame.filename, data);
        });
    }

    onPlayButtonClicked() {
        const savegame = this.app.savegameMgr.createNewSavegame();

        this.app.analytics.trackUiClick("startgame");
        this.moveToState("InGameState", {
            savegame,
        });
    }

    onLeave() {
        this.dialogs.cleanup();
    }
}
