import { THIRDPARTY_URLS } from "../core/config";
import { TextualGameState } from "../core/textual_game_state";
import { formatSecondsToTimeAgo } from "../core/utils";
import { enumCategories } from "../profile/application_settings";
import { T } from "../translations";
export class SettingsState extends TextualGameState {

    constructor() {
        super("SettingsState");
    }
    getStateHeaderTitle(): any {
        return T.settings.title;
    }
    getMainContentHTML(): any {
        return `

        <div class="sidebar">
            ${this.getCategoryButtonsHtml()}



            ${this.app.platformWrapper.getSupportsKeyboard()
            ? `
            <button class="styledButton categoryButton editKeybindings">
            ${T.keybindings.title}
            </button>`
            : ""}

            <button class="styledButton categoryButton manageMods">${T.mods.title}
                <span class="newBadge">${T.settings.newBadge}</span>
            </button>


            <div class="other">
                <button class="styledButton about">${T.about.title}</button>
                <button class="styledButton privacy">Privacy Policy</button>
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
    getCategoryButtonsHtml(): any {
        return Object.keys(enumCategories)
            .map((key: any): any => enumCategories[key])
            .map((category: any): any => `
                    <button class="styledButton categoryButton" data-category-btn="${category}">
                        ${T.settings.categories[category]}
                    </button>
                    `)
            .join("");
    }
    getSettingsHtml(): any {
        const categoriesHTML: any = {};
        Object.keys(enumCategories).forEach((key: any): any => {
            const catName: any = enumCategories[key];
            categoriesHTML[catName] = `<div class="category" data-category="${catName}">`;
        });
        for (let i: any = 0; i < this.app.settings.settingHandles.length; ++i) {
            const setting: any = this.app.settings.settingHandles[i];
            if (!setting.categoryId) {
                continue;
            }
            categoriesHTML[setting.categoryId] += setting.getHtml(this.app);
        }
        return Object.keys(categoriesHTML)
            .map((k: any): any => categoriesHTML[k] + "</div>")
            .join("");
    }
    renderBuildText(): any {
        const labelVersion: any = this.htmlElement.querySelector(".buildVersion");
        if (!labelVersion) {
            return;
        }
        const lastBuildMs: any = new Date().getTime() - G_BUILD_TIME;
        const lastBuildText: any = formatSecondsToTimeAgo(lastBuildMs / 1000.0);
        const version: any = T.settings.versionBadges[G_APP_ENVIRONMENT];
        labelVersion.innerHTML = `
            <span class='version'>
                ${G_BUILD_VERSION} @ ${version} @ ${G_BUILD_COMMIT_HASH}
            </span>
            <span class='buildTime'>
                ${T.settings.buildDate.replace("<at-date>", lastBuildText)}<br />
            </span>`;
    }
    onEnter(payload: any): any {
        this.renderBuildText();
        this.trackClicks(this.htmlElement.querySelector(".about"), this.onAboutClicked, {
            preventDefault: false,
        });
        this.trackClicks(this.htmlElement.querySelector(".privacy"), this.onPrivacyClicked, {
            preventDefault: false,
        });
        const keybindingsButton: any = this.htmlElement.querySelector(".editKeybindings");
        if (keybindingsButton) {
            this.trackClicks(keybindingsButton, this.onKeybindingsClicked, { preventDefault: false });
        }
        this.initSettings();
        this.initCategoryButtons();
        this.htmlElement.querySelector(".category").classList.add("active");
        this.htmlElement.querySelector(".categoryButton").classList.add("active");
        const modsButton: any = this.htmlElement.querySelector(".manageMods");
        if (modsButton) {
            this.trackClicks(modsButton, this.onModsClicked, { preventDefault: false });
        }
    }
    setActiveCategory(category: any): any {
        const previousCategory: any = this.htmlElement.querySelector(".category.active");
        const previousCategoryButton: any = this.htmlElement.querySelector(".categoryButton.active");
        if (previousCategory.getAttribute("data-category") == category) {
            return;
        }
        previousCategory.classList.remove("active");
        previousCategoryButton.classList.remove("active");
        const newCategory: any = this.htmlElement.querySelector("[data-category='" + category + "']");
        const newCategoryButton: any = this.htmlElement.querySelector("[data-category-btn='" + category + "']");
        newCategory.classList.add("active");
        newCategoryButton.classList.add("active");
    }
    initSettings(): any {
        this.app.settings.settingHandles.forEach((setting: any): any => {
            if (!setting.categoryId) {
                return;
            }
                        const element: HTMLElement = this.htmlElement.querySelector("[data-setting='" + setting.id + "']");
            setting.bind(this.app, element, this.dialogs);
            setting.syncValueToElement();
            this.trackClicks(element, (): any => {
                setting.modify();
            }, { preventDefault: false });
        });
    }
    initCategoryButtons(): any {
        Object.keys(enumCategories).forEach((key: any): any => {
            const category: any = enumCategories[key];
            const button: any = this.htmlElement.querySelector("[data-category-btn='" + category + "']");
            this.trackClicks(button, (): any => {
                this.setActiveCategory(category);
            }, { preventDefault: false });
        });
    }
    onAboutClicked(): any {
        this.moveToStateAddGoBack("AboutState");
    }
    onPrivacyClicked(): any {
        this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.privacyPolicy);
    }
    onKeybindingsClicked(): any {
        this.moveToStateAddGoBack("KeybindingsState");
    }
    onModsClicked(): any {
        this.moveToStateAddGoBack("ModsState");
    }
}
