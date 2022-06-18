import { cachebust } from "../core/cachebust";
import { GameState } from "../core/game_state";
import { getLogoSprite } from "../core/utils";

export class MobileWarningState extends GameState {
    constructor() {
        super("MobileWarningState");
    }

    getInnerHTML() {
        return `

            <img class="logo" src="${cachebust("res/" + getLogoSprite())}" alt="shapez.io Logo">

            <p>
                I'm sorry, but shapez.io is not available on mobile devices yet!
                There is also no estimate when this will change, but feel to make a contribution! It's
                &nbsp;<a href="https://github.com/tobspr/shapez.io" target="_blank">open source</a>!</p>

            <p>If you want to play on your computer, you can also get the game on Steam:</p>


            <a href="https://get.shapez.io/shapez_mobile" class="standaloneLink" target="_blank">Play on Steam!</a>
        `;
    }

    getThemeMusic() {
        return null;
    }

    getHasFadeIn() {
        return false;
    }

    onEnter() {
        try {
            if (window.gtag) {
                window.gtag("event", "click", {
                    event_category: "ui",
                    event_label: "mobile_warning",
                });
            }
        } catch (ex) {
            console.warn("Failed to track mobile click:", ex);
        }
    }
    onLeave() {
        // this.dialogs.cleanup();
    }
}
