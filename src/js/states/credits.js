import { TextualGameState } from "../core/textual_game_state";
import { contributors, translators } from "../../../contributors.json";
const APILink = "https://api.github.com/repos/tobspr/shapez.io"; // Should use THRIDPARY_URLS, but it is really hard to read.
const numOfReqPerPage = 100; // Max is 100, change to something lower if loads are too long

export class CreditsState extends TextualGameState {
    constructor() {
        super("CreditsState");
        this.state = "Credits";
    }

    getStateHeaderTitle() {
        return this.state;
    }

    getMainContentHTML() {
        return `
            <div class="section"><div class="title">Tobias Springer - Main Programer and Artist</div></div>
            <div class="special-shout-out section">
                <div class="title">A Special Thanks To:</div>
                <div class="people">
                    <div class="entry">Pepsin - Created the soundtrack</div>
                    <div class="entry">Sense 101 - Designed the Puzzle DLC's official puzzles</div>
                    <div class="entry">SargeanTravis - Created an achievement by whining a lot</div>
                    <div class="entry">Bagel03 - Was an absolute CHAD</div>
                    <div class="entry">Dengr - Wouldn't tell me what to put here</div>
                    <div class="entry">Block of Emerald - Also wouldn't tell me what to put here</div>
                </div>
            </div>
            <div class="translators section">
                <div class="title">Translators: </div>
                <div class="flex-people">
                    ${this.getTranslatorsHTML()}
                </div>
            </div>
            <div class="contributors section">
                <div class="title">Contributors: </div>
                <div id="loading">Loading... <div>
            </div>
        `;
    }

    getTranslatorsHTML() {
        let html = "";
        for (let i = 0; i < translators.length; i++) {
            html += `
            <br>
            <div class="entry">
                    <a href="${translators[i].username}" target="_blank">${
                translators[i].username
            }</a>: <br> ${translators[i].value
                .map(pr => {
                    return `<a href=${pr.html_url} target="_blank">${this.getGoodTitle(pr.title)}</a>, `;
                })
                .reduce((p, c) => p + c)
                .slice(0, -2)}
            </div>
            `;
        }
        return html;
    }

    getContributorsHTML() {
        let html = "";
        for (let i = 0; i < contributors.length; i++) {
            html += `
            <br>
            <div class="entry">
                    <a href="${contributors[i].username}" target="_blank">${
                contributors[i].username
            }</a>: <br> ${contributors[i].value
                .map(pr => {
                    return `<a href=${pr.html_url} target="_blank">${this.getGoodTitle(pr.title)}</a>, `;
                })
                .reduce((p, c) => p + c)
                .slice(0, -2)}
            </div>
            `;
        }
        return html;
    }

    getGoodTitle(title) {
        if (title.endsWith(".")) return title.slice(0, -1);

        return title;
    }

    onEnter() {
        // this.setPRInnerHTML();
    }
}
