import { TextualGameState } from "../core/textual_game_state";
import { formatSecondsToTimeAgo } from "../core/utils";
import { allApplicationSettings, enumCategories } from "../profile/application_settings";
import { T } from "../translations";

export class SettingsState extends TextualGameState {
    constructor() {
        super("SettingsState");
    }

    getStateHeaderTitle() {
        return T.settings.title;
    }

    getMainContentHTML() {
        return `

        <div class="sidebar">
            ${this.getCategoryButtonsHtml()}

            <div class="other">
                ${
                    this.app.platformWrapper.getSupportsKeyboard()
                        ? `<button class="styledButton editKeybindings">${T.keybindings.title}</button>`
                        : ""
                }

                <button class="styledButton about">${T.about.title}</button>

                <div class="versionbar">
                    <div class="buildVersion">${T.global.loading} ...</div>
                </div>
            </div>
        </div>

        <div class="categoryContainer">
            ${this.getSettingsHtml()}
        </div>

        `;
    }

    getCategoryButtonsHtml() {
        return Object.keys(enumCategories)
            .map(key => enumCategories[key])
            .map(
                category =>
                    `
                    <button class="styledButton categoryButton" data-category-btn="${category}">
                        ${T.settings.categories[category]}
                    </button>
                    `
            )
            .join("");
    }

    getSettingsHtml() {
        const categoriesHTML = {};

        Object.keys(enumCategories).forEach(key => {
            const catName = enumCategories[key];
            categoriesHTML[catName] = `<div class="category" data-category="${catName}">`;
        });

        for (let i = 0; i < allApplicationSettings.length; ++i) {
            const setting = allApplicationSettings[i];

            categoriesHTML[setting.categoryId] += setting.getHtml();
        }

        return Object.keys(categoriesHTML)
            .map(k => categoriesHTML[k] + "</div>")
            .join("");
    }

    renderBuildText() {
        const labelVersion = this.htmlElement.querySelector(".buildVersion");
        const lastBuildMs = new Date().getTime() - G_BUILD_TIME;
        const lastBuildText = formatSecondsToTimeAgo(lastBuildMs / 1000.0);

        const version = T.settings.versionBadges[G_APP_ENVIRONMENT];

        labelVersion.innerHTML = `
            <span class='version'>
                ${G_BUILD_VERSION} @ ${version} @ ${G_BUILD_COMMIT_HASH}
            </span>
            <span class='buildTime'>
                ${T.settings.buildDate.replace("<at-date>", lastBuildText)}<br />
            </span>`;
    }

    onEnter(payload) {
        this.renderBuildText();
        this.trackClicks(this.htmlElement.querySelector(".about"), this.onAboutClicked, {
            preventDefault: false,
        });

        const keybindingsButton = this.htmlElement.querySelector(".editKeybindings");

        if (keybindingsButton) {
            this.trackClicks(keybindingsButton, this.onKeybindingsClicked, { preventDefault: false });
        }

        this.initSettings();
        this.initCategoryButtons();

        this.htmlElement.querySelector(".category").classList.add("active");
        this.htmlElement.querySelector(".categoryButton").classList.add("active");
    }

    setActiveCategory(category) {
        const previousCategory = this.htmlElement.querySelector(".category.active");
        const previousCategoryButton = this.htmlElement.querySelector(".categoryButton.active");

        if (previousCategory.getAttribute("data-category") == category) {
            return;
        }

        previousCategory.classList.remove("active");
        previousCategoryButton.classList.remove("active");

        const newCategory = this.htmlElement.querySelector("[data-category='" + category + "']");
        const newCategoryButton = this.htmlElement.querySelector("[data-category-btn='" + category + "']");

        newCategory.classList.add("active");
        newCategoryButton.classList.add("active");
    }

    initSettings() {
        allApplicationSettings.forEach(setting => {
            const element = this.htmlElement.querySelector("[data-setting='" + setting.id + "']");
            setting.bind(this.app, element, this.dialogs);
            setting.syncValueToElement();
            this.trackClicks(
                element,
                () => {
                    setting.modify();
                },
                { preventDefault: false }
            );
        });
    }

    initCategoryButtons() {
        Object.keys(enumCategories).forEach(key => {
            const category = enumCategories[key];
            const button = this.htmlElement.querySelector("[data-category-btn='" + category + "']");
            this.trackClicks(
                button,
                () => {
                    this.setActiveCategory(category);
                },
                { preventDefault: false }
            );
        });
    }

    onAboutClicked() {
        this.moveToStateAddGoBack("AboutState");
    }

    onKeybindingsClicked() {
        this.moveToStateAddGoBack("KeybindingsState");
    }
}
