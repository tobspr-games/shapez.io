import { GameState } from "../core/game_state";
import { cachebust } from "../core/cachebust";
import { globalConfig } from "../core/config";

export class MainMenuState extends GameState {
    constructor() {
        super("MainMenuState");
    }

    getInnerHTML() {
        return `
            <div class="logo">
                <img src="${cachebust("res/logo.png")}" alt="shapez.io Logo">
            </div>


            <div class="mainContainer">
                  <button class="playButton styledButton">Play</button>
            </div>

            <div class="footer">

                <a href="https://github.com/tobspr/shapez.io" target="_blank">
                    <span class="thirdpartyLogo githubLogo"></span>
                </a>    

                <a href="https://discord.gg/HN7EVzV" target="_blank">
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
