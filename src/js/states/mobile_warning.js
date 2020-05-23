import { GameState } from "../core/game_state";
import { cachebust } from "../core/cachebust";
import { THIRDPARTY_URLS } from "../core/config";

export class MobileWarningState extends GameState {
    constructor() {
        super("MobileWarningState");
    }

    getInnerHTML() {
        return `
        
            <div class="mobileWarning">
                <img class="logo" src="${cachebust("res/logo.png")}" alt="shapez.io Logo">

                <p>
                    I'm sorry, but shapez.io is not yet available on mobile devices!
                    (There is also no estimate when this will change, but feel to make a contribution! It's
                    &nbsp;<a href="https://github.com/tobspr/shapez.io" target="_blank">open source</a>!)</p>
                
                <p>If you want to play on your computer, you can also get the standalone on itch.io:</p>

                
                <a href="${
                    THIRDPARTY_URLS.standaloneStorePage
                }" class="standaloneLink" target="_blank">Get the shapez.io standalone!</a>
            </div>
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
