import { cachebust } from "../core/cachebust";
import { GameState } from "../core/game_state";

export class MobileWarningState extends GameState {
    constructor() {
        super("MobileWarningState");
    }

    getInnerHTML() {
        return `

            <img class="logo" src="${cachebust("res/logo.png")}" alt="shapez.io Logo">

            <p>I'm sorry, but shapez.io is not available on mobile devices yet!</p>
            <p>If you have a desktop device, you can get shapez on Steam:</p>


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
