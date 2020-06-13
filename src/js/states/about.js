import { TextualGameState } from "../core/textual_game_state";
import { SOUNDS } from "../platform/sound";
import { T } from "../translations";
import { KEYMAPPINGS, getStringForKeyCode } from "../game/key_action_mapper";
import { Dialog } from "../core/modal_dialog_elements";
import { THIRDPARTY_URLS } from "../core/config";

export class AboutState extends TextualGameState {
    constructor() {
        super("AboutState");
    }

    getStateHeaderTitle() {
        return T.about.title;
    }

    getMainContentHTML() {
        return T.about.body
            .replace("<githublink>", THIRDPARTY_URLS.github)
            .replace("<discordlink>", THIRDPARTY_URLS.discord);
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
