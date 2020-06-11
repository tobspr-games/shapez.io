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
        return `
            This game is open source and developed by <a href="https://github.com/tobspr" target="_blank">Tobias Springer</a> (this is me).
            <br><br>
            If you want to contribute, check out <a href="${THIRDPARTY_URLS.github}" target="_blank">shapez.io on github</a>.
            <br><br>
            This game wouldn't have been possible without the great discord community around my games - You should really join the <a href="${THIRDPARTY_URLS.discord}" target="_blank">discord server</a>!
            <br><br>
            The soundtrack was made by <a href="https://soundcloud.com/pettersumelius" target="_blank">Peppsen</a> - He's awesome. 
            <br><br>
            Finally, huge thanks to my best friend <a href="https://github.com/niklas-dahl" target="_blank">Niklas</a> - Without our factorio sessions this game would never have existed. 
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
