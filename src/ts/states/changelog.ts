import { TextualGameState } from "../core/textual_game_state";
import { T } from "../translations";
import { CHANGELOG } from "../changelog";
export class ChangelogState extends TextualGameState {

    constructor() {
        super("ChangelogState");
    }
    getStateHeaderTitle(): any {
        return T.changelog.title;
    }
    getMainContentHTML(): any {
        const entries: any = CHANGELOG;
        let html: any = "";
        for (let i: any = 0; i < entries.length; ++i) {
            const entry: any = entries[i];
            html += `
                <div class="entry" data-changelog-skin="${entry.skin || "default"}">
                    <span class="version">${entry.version}</span>
                    <span class="date">${entry.date}</span>
                    <ul class="changes">
                        ${entry.entries.map((text: any): any => `<li>${text}</li>`).join("")}
                    </ul>
                </div>
            `;
        }
        return html;
    }
    onEnter(): any {
        const links: any = this.htmlElement.querySelectorAll("a[href]");
        links.forEach((link: any): any => {
            this.trackClicks(link, (): any => this.app.platformWrapper.openExternalLink(link.getAttribute("href")), { preventClick: true });
        });
    }
}
