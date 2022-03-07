import { THIRDPARTY_URLS } from "../core/config";
import { TextualGameState } from "../core/textual_game_state";
import { T } from "../translations";

export class ModsState extends TextualGameState {
    constructor() {
        super("ModsState");
    }

    getStateHeaderTitle() {
        return T.mods.title;
    }

    internalGetFullHtml() {
        let headerHtml = `
        <div class="headerBar">
            <h1><button class="backButton"></button> ${this.getStateHeaderTitle()}</h1>

            <div class="actions">
               ${
                   G_IS_STANDALONE
                       ? `<button class="styledButton browseMods">${T.mods.browseMods}</button>`
                       : ""
               }
            </div>

        </div>`;

        return `
        ${headerHtml}
        <div class="container">
                ${this.getInnerHTML()}
        </div>
    `;
    }

    getMainContentHTML() {
        return `
                <div class="noModSupport">

                    <p>${T.mods.noModSupport}</p>

                    <a href="#" class="steamLink steam_2_npr" target="_blank">Get the shapez.io standalone!</a>


                </div>
            `;
    }

    onEnter() {
        const steamLink = this.htmlElement.querySelector(".steamLink");
        if (steamLink) {
            this.trackClicks(steamLink, this.onSteamLinkClicked);
        }
        const openModsFolder = this.htmlElement.querySelector(".openModsFolder");
        if (openModsFolder) {
            this.trackClicks(openModsFolder, this.openModsFolder);
        }
        const browseMods = this.htmlElement.querySelector(".browseMods");
        if (browseMods) {
            this.trackClicks(browseMods, this.openBrowseMods);
        }

        const checkboxes = this.htmlElement.querySelectorAll(".checkbox");
        Array.from(checkboxes).forEach(checkbox => {
            this.trackClicks(checkbox, this.showModTogglingComingSoon);
        });
    }

    showModTogglingComingSoon() {
        this.dialogs.showWarning(T.mods.togglingComingSoon.title, T.mods.togglingComingSoon.description);
    }

    openModsFolder() {
        if (!G_IS_STANDALONE) {
            this.dialogs.showWarning(T.global.error, T.mods.folderOnlyStandalone);
            return;
        }
        ipcRenderer.invoke("open-mods-folder");
    }

    openBrowseMods() {
        this.app.analytics.trackUiClick("mods_sbrowse_link");
        this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.modBrowser);
    }

    onSteamLinkClicked() {
        this.app.analytics.trackUiClick("mods_steam_link");
        this.app.platformWrapper.openExternalLink(
            THIRDPARTY_URLS.stanaloneCampaignLink + "/shapez_modsettings_steam"
        );

        return false;
    }

    getDefaultPreviousState() {
        return "SettingsState";
    }
}
