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
