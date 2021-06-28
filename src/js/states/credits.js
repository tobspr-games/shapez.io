import { TextualGameState } from "../core/textual_game_state";
import { contributors, translators } from "../../../contributors.json";
import { T } from "../translations";

export class CreditsState extends TextualGameState {
    constructor() {
        super("CreditsState");
    }

    getStateHeaderTitle() {
        return T.credits.title;
    }

    getMainContentHTML() {
        return `
            <div class="section tobspr"><div class="title">${this.linkify(
                "https://github.com/tobspr",
                "Tobias Springer"
            )} - ${T.credits.tobspr}</div></div>
            <div class="special-shout-out section">
                <button class="title">${T.credits.specialThanks.title}:</button>
                <div class="people">
                    <div class="entry">${this.linkify(
                        "https://soundcloud.com/pettersumelius",
                        "Peppsen"
                    )} - ${T.credits.specialThanks.descriptions.peppsen}</div>
                    <div class="entry">Add some other people here (Whoever you think deserves it)</div>

                </div>
            </div>
            <div class="translators section">
                <button class="title">${T.credits.translators.title}:</button>
                <div class="people">
                    ${this.getGithubHTML(translators)}
                </div>
            </div>
            <div class="contributors section">
                <button class="title">${T.credits.translators.title}:</button>
                <div class="people">
                    ${this.getGithubHTML(contributors)}
                </div>
            </div>
        `;
    }

    linkify(href, text) {
        return `<a href="${href}" target="_blank">${text}</a>`;
    }

    getGithubHTML(list) {
        let html = "";
        for (let i = 0; i < list.length; i++) {
            html += `
            ${i === 0 ? "" : "<br>"}
            <div class="entry">
                    ${this.linkify(`https://github.com/${list[i].username}`, list[i].username)}: <br> ${list[
                i
            ].value
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
        // Allow the user to close any section by clicking on the title
        const buttons = this.htmlElement.querySelectorAll("button.title");
        buttons.forEach(button => {
            /** @type {HTMLElement} */
            //@ts-ignore
            const people = button.nextElementSibling;

            button.addEventListener("click", e => {
                if (people.style.maxHeight) {
                    people.style.maxHeight = null;
                } else {
                    people.style.maxHeight = people.scrollHeight + "px";
                }
            });

            // Set them to open at the start
            people.style.maxHeight = people.scrollHeight + "px";
        });

        // Link stuff
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
