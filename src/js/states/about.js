import { TextualGameState } from "../core/textual_game_state";
import { T } from "../translations";
import { THIRDPARTY_URLS } from "../core/config";
import { cachebust } from "../core/cachebust";

export class AboutState extends TextualGameState {
    constructor() {
        super("AboutState");
    }

    getStateHeaderTitle() {
        return T.about.title;
    }

    getMainContentHTML() {
        return `
            <div class="head">
                <img src="${cachebust(
                    G_CHINA_VERSION ? "res/logo_cn.png" : "res/logo.png"
                )}" alt="shapez.io Logo">
            </div>
            <div class="text">
            ${T.about.body
                .replace("<githublink>", THIRDPARTY_URLS.github)
                .replace("<discordlink>", THIRDPARTY_URLS.discord)}
            </div>
        `;
    }

    onEnter() {
        const links = this.htmlElement.querySelectorAll("a[href]");
        links.forEach(link => {
            this.trackClicks(
                link,
                () => this.app.platformWrapper.openExternalLink(link.getAttribute("href")),
                { preventClick: true }
            );
        });
    }

    getDefaultPreviousState() {
        return "SettingsState";
    }
}
