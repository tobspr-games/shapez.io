import { GameState } from "../core/game_state";
import { cachebust } from "../core/cachebust";
import { globalConfig } from "../core/config";
import { makeDiv, formatSecondsToTimeAgo } from "../core/utils";

export class MainMenuState extends GameState {
    constructor() {
        super("MainMenuState");
    }

    getInnerHTML() {
        return `

            <video autoplay muted loop class="fullscreenBackgroundVideo">
                <source src="${cachebust("res/bg_render.webm")}" type="video/webm">
            </video>

            <div class="logo">
                <img src="${cachebust("res/logo.png")}" alt="shapez.io Logo">
            </div>
        
            <div class="betaWarning">
                This game is still under development - Please report any issues!
            </div>

            <div class="mainContainer">

                  <button class="playButton styledButton">Play</button>
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

    onBackButton() {
        this.app.platformWrapper.exitApp();
    }

    onEnter(payload) {
        if (payload.loadError) {
            alert("Error while loading game: " + payload.loadError);
        }

        const qs = this.htmlElement.querySelector.bind(this.htmlElement);
        this.trackClicks(qs(".mainContainer .playButton"), this.onPlayButtonClicked);

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
        const games = this.app.savegameMgr.getSavegamesMetaData();
        if (games.length > 0) {
            const parent = makeDiv(this.htmlElement.querySelector(".mainContainer"), null, ["savegames"]);

            for (let i = 0; i < games.length; ++i) {
                const elem = makeDiv(parent, null, ["savegame"]);

                makeDiv(elem, null, ["internalId"], games[i].internalId.substr(0, 15));
                makeDiv(
                    elem,
                    null,
                    ["updateTime"],
                    formatSecondsToTimeAgo((new Date().getTime() - games[i].lastUpdate) / 1000.0)
                );

                const resumeBtn = document.createElement("button");
                resumeBtn.classList.add("styledButton", "resumeGame");
                elem.appendChild(resumeBtn);

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

    onPlayButtonClicked() {
        const savegame = this.app.savegameMgr.createNewSavegame();

        this.app.analytics.trackUiClick("startgame");
        this.moveToState("InGameState", {
            savegame,
        });
    }

    onLeave() {
        // this.dialogs.cleanup();
    }
}
