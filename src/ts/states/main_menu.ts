import { cachebust } from "../core/cachebust";
import { globalConfig, openStandaloneLink, THIRDPARTY_URLS } from "../core/config";
import { GameState } from "../core/game_state";
import { DialogWithForm } from "../core/modal_dialog_elements";
import { FormElementInput } from "../core/modal_dialog_forms";
import { ReadWriteProxy } from "../core/read_write_proxy";
import { STOP_PROPAGATION } from "../core/signal";
import { WEB_STEAM_SSO_AUTHENTICATED } from "../core/steam_sso";
import { formatSecondsToTimeAgo, generateFileDownload, getLogoSprite, makeButton, makeDiv, makeDivElement, removeAllChildren, startFileChoose, waitNextFrame, } from "../core/utils";
import { HUDModalDialogs } from "../game/hud/parts/modal_dialogs";
import { MODS } from "../mods/modloader";
import { PlatformWrapperImplBrowser } from "../platform/browser/wrapper";
import { PlatformWrapperImplElectron } from "../platform/electron/wrapper";
import { Savegame } from "../savegame/savegame";
import { T } from "../translations";
const trim: any = require("trim");
export type SavegameMetadata = import("../savegame/savegame_typedefs").SavegameMetadata;
export type EnumSetting = import("../profile/setting_types").EnumSetting;

export class MainMenuState extends GameState {
    public refreshInterval = null;

    constructor() {
        super("MainMenuState");
    }
    getInnerHTML(): any {
        const showExitAppButton: any = G_IS_STANDALONE;
        const showPuzzleDLC: any = G_IS_STANDALONE || WEB_STEAM_SSO_AUTHENTICATED;
        const hasMods: any = MODS.anyModsActive();
        let showExternalLinks: any = true;
        if (!G_IS_STANDALONE) {
            const wrapper: any = (this.app.platformWrapper as PlatformWrapperImplBrowser);
            if (!wrapper.embedProvider.externalLinks) {
                showExternalLinks = false;
            }
        }
        const showDemoAdvertisement: any = showExternalLinks && this.app.restrictionMgr.getIsStandaloneMarketingActive();
        const ownsPuzzleDLC: any = WEB_STEAM_SSO_AUTHENTICATED ||
            (G_IS_STANDALONE &&
                this.app.platformWrapper as PlatformWrapperImplElectron).dlcs.puzzle);
        const showShapez2: any = showExternalLinks && MODS.mods.length === 0;
        const bannerHtml: any = `
            <h3>${T.demoBanners.titleV2}</h3>


            <div class="points">
                ${Array.from(Object.entries(T.ingame.standaloneAdvantages.points))
            .slice(0, 6)
            .map(([key, trans]: any): any => `
                <div class="point ${key}">
                    <strong>${trans.title}</strong>
                    <p>${trans.desc}</p>
                </div>`)
            .join("")}

            </div>


            <a href="#" class="steamLink steam_dlbtn_0" target="_blank">
            ${globalConfig.currentDiscount > 0
            ? `<span class='discount'>${T.global.discount.replace("<percentage>", String(globalConfig.currentDiscount))}</span>`
            : ""}
                Play shapez on Steam
            </a>
            <div class="onlinePlayerCount"></div>
        `;
        return `
            <div class="topButtons">
                <button aria-label="Choose Language" class="languageChoose" data-languageicon="${this.app.settings.getLanguage()}"></button>

                <button class="settingsButton" aria-label="Settings"></button>
                ${showExitAppButton ? `<button class="exitAppButton" aria-label="Exit App"></button>` : ""}
            </div>


            <video autoplay muted loop class="fullscreenBackgroundVideo">
                <source src="${cachebust("res/bg_render.webm")}" type="video/webm">
            </video>

            <div class="logo">
                <img src="${cachebust("res/" + getLogoSprite())}" alt="shapez.io Logo"
                    width="${Math.round((710 / 3) * this.app.getEffectiveUiScale())}"
                    height="${Math.round((180 / 3) * this.app.getEffectiveUiScale())}"
                >
                ${ /*showUpdateLabel ? `<span class="updateLabel">MODS UPDATE!</span>` : ""*/""}
            </div>

            <div class="mainWrapper" data-columns="${showDemoAdvertisement || showPuzzleDLC ? 2 : 1}">
                <div class="mainContainer">
                    <div class="buttons"></div>
                    <div class="savegamesMount"></div>
                    ${G_IS_STANDALONE || !WEB_STEAM_SSO_AUTHENTICATED
            ? `<div class="steamSso">
                                <span class="description">${G_IS_STANDALONE
                ? T.mainMenu.playFullVersionStandalone
                : T.mainMenu.playFullVersionV2}</span>
                                <a class="ssoSignIn" target="_blank" href="${this.app.clientApi.getEndpoint() + "/v1/noauth/steam-sso"}">Sign in</a>
                            </div>`
            : ""}
                    ${WEB_STEAM_SSO_AUTHENTICATED
            ? `
                            <div class="steamSso">
                                <span class="description">${T.mainMenu.playingFullVersion}</span>
                                <a class="ssoSignOut" href="?sso_logout_silent">${T.mainMenu.logout}</a>

                            </div>
                        `
            : ""}



                </div>

                <div class="sideContainer">
                    ${showDemoAdvertisement ? `<div class="standaloneBanner">${bannerHtml}</div>` : ""}

                    ${showShapez2
            ? `<div class="mainNews shapez2">
                        <div class="text">We are currently prototyping Shapez 2!</div>

                    </div>`
            : ""}

                ${showPuzzleDLC
            ? `

                        ${ownsPuzzleDLC && !hasMods
                ? `
                            <div class="puzzleContainer owned">
                                <button class="styledButton puzzleDlcPlayButton">${T.mainMenu.play}</button>
                            </div>`
                : ""}

                        ${!ownsPuzzleDLC && !hasMods
                ? `
                            <div class="puzzleContainer notOwned">
                                <p>${T.mainMenu.puzzleDlcText}</p>
                                <button class="styledButton puzzleDlcGetButton">${T.mainMenu.puzzleDlcViewNow}</button>
                            </div>`
                : ""}



                `
            : ""}


                ${hasMods
            ? `

                        <div class="modsOverview">
                            <div class="header">
                                <h3>${T.mods.title}</h3>
                                <button class="styledButton editMods"></button>
                            </div>
                            <div class="modsList">
                            ${MODS.mods
                .map((mod: any): any => {
                return `
                                    <div class="mod">
                                        <div class="name">${mod.metadata.name}</div>
                                        <div class="author">by ${mod.metadata.author}</div>
                                    </div>
                                `;
            })
                .join("")}
                            </div>

                            <div class="dlcHint">
                                ${T.mainMenu.mods.warningPuzzleDLC}
                            </div>


                        </div>
                        `
            : ""}

                </div>


            </div>

                <div class="footer ${showExternalLinks ? "" : "noLinks"} ">

                    <div class="socialLinks">
                    ${showExternalLinks
            ? `<a class="patreonLink boxLink" target="_blank">
                                    <span class="thirdpartyLogo patreonLogo"></span>
                                    <span class="label">Patreon</span>
                                </a>`
            : ""}
                    ${showExternalLinks && !G_IS_STANDALONE
            ? `<a class="steamLinkSocial boxLink" target="_blank">
                                    <span class="thirdpartyLogo steamLogo"></span>
                                    <span class="label">steam</span>
                                </a>`
            : ""}
                    ${showExternalLinks
            ? `
                        <a class="githubLink boxLink" target="_blank">
                            <span class="thirdpartyLogo githubLogo"></span>
                            <span class="label">GitHub</span>
                        </a>`
            : ""}


                    ${showExternalLinks
            ? `<a class="discordLink boxLink" target="_blank">
                                    <span class="thirdpartyLogo  discordLogo"></span>
                                    <span class="label">Discord</span>
                                </a>`
            : ""}

                    ${showExternalLinks
            ? `<a class="redditLink boxLink" target="_blank">
                                    <span class="thirdpartyLogo redditLogo"></span>
                                    <span class="label">Reddit</span>
                                </a>`
            : ""}

                    ${
        /*
        showExternalLinks
            ? `<a class="twitterLink boxLink" target="_blank">
                    <span class="thirdpartyLogo twitterLogo"></span>
                    <span class="label">Twitter</span>
                </a>`
            : ""
            */
        ""}


                    </div>

                    <div class="footerGrow">
                        ${showExternalLinks ? `<a class="changelog">${T.changelog.title}</a>` : ""}

                        ${showExternalLinks ? `<a class="helpTranslate">${T.mainMenu.helpTranslate}</a>` : ""}

                    </div>
                        <div class="author"><a class="producerLink" href="https://tobspr.io" target="_blank" title="tobspr Games" rel="follow">
                        <img src="${cachebust("res/logo-tobspr-games.svg")}" alt="tobspr Games"
                        height="${25 * 0.8 * this.app.getEffectiveUiScale()}"
                        width="${82 * 0.8 * this.app.getEffectiveUiScale()}"
                        >

                    </a></div>

                </div>
        `;
    }
    /**
     * Asks the user to import a savegame
     */
    requestImportSavegame(): any {
        if (this.app.savegameMgr.getSavegamesMetaData().length > 0 &&
            !this.app.restrictionMgr.getHasUnlimitedSavegames()) {
            this.showSavegameSlotLimit();
            return;
        }
        this.app.gameAnalytics.note("startimport");
        // Create a 'fake' file-input to accept savegames
        startFileChoose(".bin").then((file: any): any => {
            if (file) {
                const closeLoader: any = this.dialogs.showLoadingDialog();
                waitNextFrame().then((): any => {
                    const reader: any = new FileReader();
                    reader.addEventListener("load", (event: any): any => {
                        const contents: any = event.target.result;
                        let realContent: any;
                        try {
                            realContent = ReadWriteProxy.deserializeObject(contents);
                        }
                        catch (err: any) {
                            closeLoader();
                            this.dialogs.showWarning(T.dialogs.importSavegameError.title, T.dialogs.importSavegameError.text + "<br><br>" + err);
                            return;
                        }
                        this.app.savegameMgr.importSavegame(realContent).then((): any => {
                            closeLoader();
                            this.dialogs.showWarning(T.dialogs.importSavegameSuccess.title, T.dialogs.importSavegameSuccess.text);
                            this.renderMainMenu();
                            this.renderSavegames();
                        }, (err: any): any => {
                            closeLoader();
                            this.dialogs.showWarning(T.dialogs.importSavegameError.title, T.dialogs.importSavegameError.text + ":<br><br>" + err);
                        });
                    });
                    reader.addEventListener("error", (error: any): any => {
                        this.dialogs.showWarning(T.dialogs.importSavegameError.title, T.dialogs.importSavegameError.text + ":<br><br>" + error);
                    });
                    reader.readAsText(file, "utf-8");
                });
            }
        });
    }
    onBackButton(): any {
        this.app.platformWrapper.exitApp();
    }
    onEnter(payload: any): any {
        // Start loading already
        const app: any = this.app;
        setTimeout((): any => app.backgroundResourceLoader.getIngamePromise(), 10);
        this.dialogs = new HUDModalDialogs(null, this.app);
        const dialogsElement: any = document.body.querySelector(".modalDialogParent");
        this.dialogs.initializeToElement(dialogsElement);
        if (payload.loadError) {
            this.dialogs.showWarning(T.dialogs.gameLoadFailure.title, T.dialogs.gameLoadFailure.text + "<br><br>" + payload.loadError);
        }
        if (G_IS_DEV && globalConfig.debug.testPuzzleMode) {
            this.onPuzzleModeButtonClicked(true);
            return;
        }
        if (G_IS_DEV && globalConfig.debug.fastGameEnter) {
            const games: any = this.app.savegameMgr.getSavegamesMetaData();
            if (games.length > 0 && globalConfig.debug.resumeGameOnFastEnter) {
                this.resumeGame(games[0]);
            }
            else {
                this.onPlayButtonClicked();
            }
        }
        // Initialize video
        this.videoElement = this.htmlElement.querySelector("video");
        this.videoElement.playbackRate = 0.9;
        this.videoElement.addEventListener("canplay", (): any => {
            if (this.videoElement) {
                this.videoElement.classList.add("loaded");
            }
        });
        const clickHandling: any = {
            ".settingsButton": this.onSettingsButtonClicked,
            ".languageChoose": this.onLanguageChooseClicked,
            ".redditLink": this.onRedditClicked,
            ".twitterLink": this.onTwitterLinkClicked,
            ".patreonLink": this.onPatreonLinkClicked,
            ".changelog": this.onChangelogClicked,
            ".helpTranslate": this.onTranslationHelpLinkClicked,
            ".exitAppButton": this.onExitAppButtonClicked,
            ".steamLink": this.onSteamLinkClicked,
            ".steamLinkSocial": this.onSteamLinkClickedSocial,
            ".shapez2": this.onShapez2Clicked,
            ".discordLink": (): any => {
                this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.discord);
            },
            ".githubLink": (): any => {
                this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.github);
            },
            ".puzzleDlcPlayButton": this.onPuzzleModeButtonClicked,
            ".puzzleDlcGetButton": this.onPuzzleWishlistButtonClicked,
            ".wegameDisclaimer > .rating": this.onWegameRatingClicked,
            ".editMods": this.onModsClicked,
        };
        for (const key: any in clickHandling) {
            const handler: any = clickHandling[key];
            const element: any = this.htmlElement.querySelector(key);
            if (element) {
                this.trackClicks(element, handler, { preventClick: true });
            }
        }
        this.renderMainMenu();
        this.renderSavegames();
        this.fetchPlayerCount();
        this.refreshInterval = setInterval((): any => this.fetchPlayerCount(), 10000);
        this.app.gameAnalytics.noteMinor("menu.enter");
    }
    renderMainMenu(): any {
        const buttonContainer: any = this.htmlElement.querySelector(".mainContainer .buttons");
        removeAllChildren(buttonContainer);
        const outerDiv: any = makeDivElement(null, ["outer"], null);
        // Import button
        this.trackClicks(makeButton(outerDiv, ["importButton", "styledButton"], T.mainMenu.importSavegame), this.requestImportSavegame);
        if (this.savedGames.length > 0) {
            // Continue game
            this.trackClicks(makeButton(buttonContainer, ["continueButton", "styledButton"], T.mainMenu.continue), this.onContinueButtonClicked);
            // New game
            this.trackClicks(makeButton(outerDiv, ["newGameButton", "styledButton"], T.mainMenu.newGame), this.onPlayButtonClicked);
        }
        else {
            // New game
            this.trackClicks(makeButton(buttonContainer, ["playButton", "styledButton"], T.mainMenu.play), this.onPlayButtonClicked);
        }
        this.htmlElement
            .querySelector(".mainContainer")
            .setAttribute("data-savegames", String(this.savedGames.length));
        // Mods
        this.trackClicks(makeButton(outerDiv, ["modsButton", "styledButton"], T.mods.title), this.onModsClicked);
        buttonContainer.appendChild(outerDiv);
    }
    fetchPlayerCount(): any {
                const element: HTMLDivElement = this.htmlElement.querySelector(".onlinePlayerCount");
        if (!element) {
            return;
        }
        fetch("https://analytics.shapez.io/v1/player-count", {
            cache: "no-cache",
        })
            .then((res: any): any => res.json())
            .then((count: any): any => {
            element.innerText = T.demoBanners.playerCount.replace("<playerCount>", String(count));
        }, (ex: any): any => {
            console.warn("Failed to get player count:", ex);
        });
    }
    onPuzzleModeButtonClicked(force: any = false): any {
        const hasUnlockedBlueprints: any = this.app.savegameMgr.getSavegamesMetaData().some((s: any): any => s.level >= 12);
        if (!force && !hasUnlockedBlueprints) {
            const { ok }: any = this.dialogs.showWarning(T.dialogs.puzzlePlayRegularRecommendation.title, T.dialogs.puzzlePlayRegularRecommendation.desc, ["cancel:good", "ok:bad:timeout"]);
            ok.add((): any => this.onPuzzleModeButtonClicked(true));
            return;
        }
        this.moveToState("LoginState", {
            nextStateId: "PuzzleMenuState",
        });
    }
    onPuzzleWishlistButtonClicked(): any {
        this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.puzzleDlcStorePage);
    }
    onShapez2Clicked(): any {
        this.app.platformWrapper.openExternalLink("https://tobspr.io/shapez-2?utm_medium=shapez");
    }
    onBackButtonClicked(): any {
        this.renderMainMenu();
        this.renderSavegames();
    }
    onSteamLinkClicked(): any {
        openStandaloneLink(this.app, "shapez_mainmenu");
        return false;
    }
    onSteamLinkClickedSocial(): any {
        openStandaloneLink(this.app, "shapez_mainmenu_social");
        return false;
    }
    onExitAppButtonClicked(): any {
        this.app.platformWrapper.exitApp();
    }
    onChangelogClicked(): any {
        this.moveToState("ChangelogState");
    }
    onRedditClicked(): any {
        this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.reddit);
    }
    onTwitterLinkClicked(): any {
        this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.twitter);
    }
    onPatreonLinkClicked(): any {
        this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.patreon);
    }
    onLanguageChooseClicked(): any {
        const setting: any = (this.app.settings.getSettingHandleById("language") as EnumSetting);
        const { optionSelected }: any = this.dialogs.showOptionChooser(T.settings.labels.language.title, {
            active: this.app.settings.getLanguage(),
            options: setting.options.map((option: any): any => ({
                value: setting.valueGetter(option),
                text: setting.textGetter(option),
                desc: setting.descGetter(option),
                iconPrefix: setting.iconPrefix,
            })),
        });
        optionSelected.add((value: any): any => {
            this.app.settings.updateLanguage(value).then((): any => {
                if (setting.restartRequired) {
                    if (this.app.platformWrapper.getSupportsRestart()) {
                        this.app.platformWrapper.performRestart();
                    }
                    else {
                        this.dialogs.showInfo(T.dialogs.restartRequired.title, T.dialogs.restartRequired.text, ["ok:good"]);
                    }
                }
                if (setting.changeCb) {
                    setting.changeCb(this.app, value);
                }
            });
            // Update current icon
            this.htmlElement.querySelector("button.languageChoose").setAttribute("data-languageIcon", value);
        }, this);
    }
    get savedGames() {
        return this.app.savegameMgr.getSavegamesMetaData();
    }
    renderSavegames(): any {
        const oldContainer: any = this.htmlElement.querySelector(".mainContainer .savegames");
        if (oldContainer) {
            oldContainer.remove();
        }
        const games: any = this.savedGames;
        if (games.length > 0) {
            const parent: any = makeDiv(this.htmlElement.querySelector(".mainContainer .savegamesMount"), null, [
                "savegames",
            ]);
            for (let i: any = 0; i < games.length; ++i) {
                const elem: any = makeDiv(parent, null, ["savegame"]);
                makeDiv(elem, null, ["playtime"], formatSecondsToTimeAgo((new Date().getTime() - games[i].lastUpdate) / 1000.0));
                makeDiv(elem, null, ["level"], games[i].level
                    ? T.mainMenu.savegameLevel.replace("<x>", "" + games[i].level)
                    : T.mainMenu.savegameLevelUnknown);
                const name: any = makeDiv(elem, null, ["name"], "<span>" + (games[i].name ? games[i].name : T.mainMenu.savegameUnnamed) + "</span>");
                const deleteButton: any = document.createElement("button");
                deleteButton.classList.add("styledButton", "deleteGame");
                deleteButton.setAttribute("aria-label", "Delete");
                elem.appendChild(deleteButton);
                const downloadButton: any = document.createElement("button");
                downloadButton.classList.add("styledButton", "downloadGame");
                downloadButton.setAttribute("aria-label", "Download");
                elem.appendChild(downloadButton);
                const renameButton: any = document.createElement("button");
                renameButton.classList.add("styledButton", "renameGame");
                renameButton.setAttribute("aria-label", "Rename Savegame");
                name.appendChild(renameButton);
                this.trackClicks(renameButton, (): any => this.requestRenameSavegame(games[i]));
                const resumeButton: any = document.createElement("button");
                resumeButton.classList.add("styledButton", "resumeGame");
                resumeButton.setAttribute("aria-label", "Resumee");
                elem.appendChild(resumeButton);
                this.trackClicks(deleteButton, (): any => this.deleteGame(games[i]));
                this.trackClicks(downloadButton, (): any => this.downloadGame(games[i]));
                this.trackClicks(resumeButton, (): any => this.resumeGame(games[i]));
            }
        }
        else {
            const parent: any = makeDiv(this.htmlElement.querySelector(".mainContainer .savegamesMount"), null, ["savegamesNone"], T.mainMenu.noActiveSavegames);
        }
    }
        requestRenameSavegame(game: SavegameMetadata): any {
        const regex: any = /^[a-zA-Z0-9_\- ]{1,20}$/;
        const nameInput: any = new FormElementInput({
            id: "nameInput",
            label: null,
            placeholder: "",
            defaultValue: game.name || "",
            validator: (val: any): any => val.match(regex) && trim(val).length > 0,
        });
        const dialog: any = new DialogWithForm({
            app: this.app,
            title: T.dialogs.renameSavegame.title,
            desc: T.dialogs.renameSavegame.desc,
            formElements: [nameInput],
            buttons: ["cancel:bad:escape", "ok:good:enter"],
        });
        this.dialogs.internalShowDialog(dialog);
        // When confirmed, save the name
        dialog.buttonSignals.ok.add((): any => {
            game.name = trim(nameInput.getValue());
            this.app.savegameMgr.writeAsync();
            this.renderSavegames();
        });
    }
        resumeGame(game: SavegameMetadata): any {
        this.app.adProvider.showVideoAd().then((): any => {
            const savegame: any = this.app.savegameMgr.getSavegameById(game.internalId);
            savegame
                .readAsync()
                .then((): any => this.checkForModDifferences(savegame))
                .then((): any => {
                this.moveToState("InGameState", {
                    savegame,
                });
            })
                .catch((err: any): any => {
                this.dialogs.showWarning(T.dialogs.gameLoadFailure.title, T.dialogs.gameLoadFailure.text + "<br><br>" + err);
            });
        });
    }
        checkForModDifferences(savegame: Savegame): any {
        const difference: any = MODS.computeModDifference(savegame.currentData.mods);
        if (difference.missing.length === 0 && difference.extra.length === 0) {
            return Promise.resolve();
        }
        let dialogHtml: any = T.dialogs.modsDifference.desc;
        
        function formatMod(mod: import("../savegame/savegame_typedefs").SavegameStoredMods[0]): any {
            return `
                <div class="dialogModsMod">
                    <div class="name">${mod.name}</div>
                    <div class="version">${T.mods.version} ${mod.version}</div>
                    <button class="website styledButton" onclick="window.open('${mod.website.replace(/"'/, "")}')">${T.mods.modWebsite}
            </button>

                </div>
            `;
        }
        if (difference.missing.length > 0) {
            dialogHtml += "<h3>" + T.dialogs.modsDifference.missingMods + "</h3>";
            dialogHtml += difference.missing.map(formatMod).join("<br>");
        }
        if (difference.extra.length > 0) {
            dialogHtml += "<h3>" + T.dialogs.modsDifference.newMods + "</h3>";
            dialogHtml += difference.extra.map(formatMod).join("<br>");
        }
        const signals: any = this.dialogs.showWarning(T.dialogs.modsDifference.title, dialogHtml, [
            "cancel:good",
            "continue:bad",
        ]);
        return new Promise((resolve: any): any => {
            signals.continue.add(resolve);
        });
    }
        deleteGame(game: SavegameMetadata): any {
        const signals: any = this.dialogs.showWarning(T.dialogs.confirmSavegameDelete.title, T.dialogs.confirmSavegameDelete.text
            .replace("<savegameName>", game.name || T.mainMenu.savegameUnnamed)
            .replace("<savegameLevel>", String(game.level)), ["cancel:good", "delete:bad:timeout"]);
        signals.delete.add((): any => {
            this.app.savegameMgr.deleteSavegame(game).then((): any => {
                this.renderSavegames();
                if (this.savedGames.length <= 0)
                    this.renderMainMenu();
            }, (err: any): any => {
                this.dialogs.showWarning(T.dialogs.savegameDeletionError.title, T.dialogs.savegameDeletionError.text + "<br><br>" + err);
            });
        });
    }
        downloadGame(game: SavegameMetadata): any {
        const savegame: any = this.app.savegameMgr.getSavegameById(game.internalId);
        savegame.readAsync().then((): any => {
            const data: any = ReadWriteProxy.serializeObject(savegame.currentData);
            const filename: any = (game.name || "unnamed") + ".bin";
            generateFileDownload(filename, data);
        });
    }
    /**
     * Shows a hint that the slot limit has been reached
     */
    showSavegameSlotLimit(): any {
        const { getStandalone }: any = this.dialogs.showWarning(T.dialogs.oneSavegameLimit.title, T.dialogs.oneSavegameLimit.desc, ["cancel:bad", "getStandalone:good"]);
        getStandalone.add((): any => {
            openStandaloneLink(this.app, "shapez_slotlimit");
        });
        this.app.gameAnalytics.note("slotlimit");
    }
    onSettingsButtonClicked(): any {
        this.moveToState("SettingsState");
    }
    onTranslationHelpLinkClicked(): any {
        this.app.platformWrapper.openExternalLink("https://github.com/tobspr-games/shapez.io/blob/master/translations");
    }
    onPlayButtonClicked(): any {
        if (this.app.savegameMgr.getSavegamesMetaData().length > 0 &&
            !this.app.restrictionMgr.getHasUnlimitedSavegames()) {
            this.app.gameAnalytics.noteMinor("menu.slotlimit");
            this.showSavegameSlotLimit();
            return;
        }
        this.app.adProvider.showVideoAd().then((): any => {
            this.app.gameAnalytics.noteMinor("menu.play");
            const savegame: any = this.app.savegameMgr.createNewSavegame();
            this.moveToState("InGameState", {
                savegame,
            });
        });
    }
    onWegameRatingClicked(): any {
        this.dialogs.showInfo("提示说明：", `
            1）本游戏是一款休闲建造类单机游戏，画面简洁而乐趣充足。适用于年满8周岁及以上的用户，建议未成年人在家长监护下使用游戏产品。<br>
            2）本游戏模拟简单的生产流水线，剧情简单且积极向上，没有基于真实历史和现实事件的改编内容。游戏玩法为摆放简单的部件，完成生产目标。游戏为单机作品，没有基于文字和语音的陌生人社交系统。<br>
            3）本游戏中有用户实名认证系统，认证为未成年人的用户将接受以下管理：未满8周岁的用户不能付费；8周岁以上未满16周岁的未成年人用户，单次充值金额不得超过50元人民币，每月充值金额累计不得超过200元人民币；16周岁以上的未成年人用户，单次充值金额不得超过100元人民币，每月充值金额累计不得超过400元人民币。未成年玩家，仅可在周五、周六、周日和法定节假日每日20时至21时进行游戏。<br>
            4）游戏功能说明：一款关于传送带自动化生产特定形状产品的工厂流水线模拟游戏，画面简洁而乐趣充足，可以让玩家在轻松愉快的氛围下获得各种游戏乐趣，体验完成目标的成就感。游戏没有失败功能，自动存档，不存在较强的挫折体验。
        `);
    }
    onModsClicked(): any {
        this.app.gameAnalytics.noteMinor("menu.mods");
        this.moveToState("ModsState", {
            backToStateId: "MainMenuState",
        });
    }
    onContinueButtonClicked(): any {
        let latestLastUpdate: any = 0;
        let latestInternalId: any;
        this.app.savegameMgr.currentData.savegames.forEach((saveGame: any): any => {
            if (saveGame.lastUpdate > latestLastUpdate) {
                latestLastUpdate = saveGame.lastUpdate;
                latestInternalId = saveGame.internalId;
            }
        });
        const savegame: any = this.app.savegameMgr.getSavegameById(latestInternalId);
        if (!savegame) {
            console.warn("No savegame to continue found:", this.app.savegameMgr.currentData.savegames);
            return;
        }
        this.app.gameAnalytics.noteMinor("menu.continue");
        savegame
            .readAsync()
            .then((): any => this.app.adProvider.showVideoAd())
            .then((): any => this.checkForModDifferences(savegame))
            .then((): any => {
            this.moveToState("InGameState", {
                savegame,
            });
        });
    }
    onLeave(): any {
        this.dialogs.cleanup();
        clearInterval(this.refreshInterval);
    }
}
