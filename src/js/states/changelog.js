import { TextualGameState } from "../core/textual_game_state";
import { T } from "../translations";
import { CHANGELOG } from "../changelog";

export class ChangelogState extends TextualGameState {
    constructor() {
        super("ChangelogState");
    }

    getStateHeaderTitle() {
        return T.changelog.title;
    }

    getMainContentHTML() {
        const entries = CHANGELOG;

        let html = "";

        for (let i = 0; i < entries.length; ++i) {
            const entry = entries[i];
            html += `
                <div class="entry" data-changelog-skin="${entry.skin || "default"}">
                    <span class="version">${entry.version}</span>
                    <span class="date">${entry.date}</span>
                    <ul class="changes">
                        ${entry.entries.map(text => `<li>${text}</li>`).join("")}
                    </ul>
                </div>
            `;
        }

        return html;
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
}
