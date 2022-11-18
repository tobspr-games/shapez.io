import { CHANGELOG } from "../changelog";
import { cachebust } from "../core/cachebust";
import { globalConfig, THIRDPARTY_URLS } from "../core/config";
import { GameState } from "../core/game_state";
import { createLogger } from "../core/logging";
import { queryParamOptions } from "../core/query_parameters";
import { authorizeViaSSOToken } from "../core/steam_sso";
import { getLogoSprite, timeoutPromise } from "../core/utils";
import { getRandomHint } from "../game/hints";
import { HUDModalDialogs } from "../game/hud/parts/modal_dialogs";
import { PlatformWrapperImplBrowser } from "../platform/browser/wrapper";
import { autoDetectLanguageId, T, updateApplicationLanguage } from "../translations";
const logger: any = createLogger("state/preload");
export class PreloadState extends GameState {

    constructor() {
        super("PreloadState");
    }
    getThemeMusic(): any {
        return null;
    }
    getHasFadeIn(): any {
        return false;
    }
    getRemovePreviousContent(): any {
        return false;
    }
    onEnter(): any {
        this.dialogs = new HUDModalDialogs(null, this.app);
        const dialogsElement: any = document.body.querySelector(".modalDialogParent");
        this.dialogs.initializeToElement(dialogsElement);
                this.hintsText = this.htmlElement.querySelector("#preload_ll_text");
        this.lastHintShown = -1000;
        this.nextHintDuration = 0;
                this.statusText = this.htmlElement.querySelector("#ll_preload_status");
                this.progressElement = this.htmlElement.querySelector("#ll_progressbar span");
        this.startLoading();
    }
    async fetchDiscounts(): any {
        await timeoutPromise(fetch("https://analytics.shapez.io/v1/discounts")
            .then((res: any): any => res.json())
            .then((data: any): any => {
            globalConfig.currentDiscount = Number(data["1318690"].data.price_overview.discount_percent);
            logger.log("Fetched current discount:", globalConfig.currentDiscount);
        }), 2000).catch((err: any): any => {
            logger.warn("Failed to fetch current discount:", err);
        });
    }
    async sendBeacon(): any {
        if (G_IS_STANDALONE) {
            return;
        }
        if (queryParamOptions.campaign) {
            fetch("https://analytics.shapez.io/campaign/" +
                queryParamOptions.campaign +
                "?lpurl=nocontent&fbclid=" +
                (queryParamOptions.fbclid || "") +
                "&gclid=" +
                (queryParamOptions.gclid || "")).catch((err: any): any => {
                console.warn("Failed to send beacon:", err);
            });
        }
        if (queryParamOptions.embedProvider) {
            fetch("https://analytics.shapez.io/campaign/embed_" +
                queryParamOptions.embedProvider +
                "?lpurl=nocontent").catch((err: any): any => {
                console.warn("Failed to send beacon:", err);
            });
        }
    }
    onLeave(): any {
        // this.dialogs.cleanup();
    }
    startLoading(): any {
        this.setStatus("Booting")
            .then((): any => {
            try {
                window.localStorage.setItem("local_storage_feature_detection", "1");
            }
            catch (ex: any) {
                throw new Error("Could not access local storage. Make sure you are not playing in incognito mode and allow thirdparty cookies!");
            }
        })
            .then((): any => this.setStatus("Creating platform wrapper", 3))
            .then((): any => this.sendBeacon())
            .then((): any => authorizeViaSSOToken(this.app, this.dialogs))
            .then((): any => this.app.platformWrapper.initialize())
            .then((): any => this.setStatus("Initializing local storage", 6))
            .then((): any => {
            const wrapper: any = this.app.platformWrapper;
            if (wrapper instanceof PlatformWrapperImplBrowser) {
                try {
                    window.localStorage.setItem("local_storage_test", "1");
                    window.localStorage.removeItem("local_storage_test");
                }
                catch (ex: any) {
                    logger.error("Failed to read/write local storage:", ex);
                    return new Promise((): any => {
                        alert("Your brower does not support thirdparty cookies or you have disabled it in your security settings.\n\n" +
                            "In Chrome this setting is called 'Block third-party cookies and site data'.\n\n" +
                            "Please allow third party cookies and then reload the page.");
                        // Never return
                    });
                }
            }
        })
            .then((): any => this.setStatus("Creating storage", 9))
            .then((): any => {
            return this.app.storage.initialize();
        })
            .then((): any => this.setStatus("Initializing libraries", 12))
            .then((): any => this.app.analytics.initialize())
            .then((): any => this.app.gameAnalytics.initialize())
            .then((): any => this.setStatus("Connecting to api", 15))
            .then((): any => this.fetchDiscounts())
            .then((): any => this.setStatus("Initializing settings", 20))
            .then((): any => {
            return this.app.settings.initialize();
        })
            .then((): any => {
            // Initialize fullscreen
            if (this.app.platformWrapper.getSupportsFullscreen()) {
                this.app.platformWrapper.setFullscreen(this.app.settings.getIsFullScreen());
            }
        })
            .then((): any => this.setStatus("Initializing language", 25))
            .then((): any => {
            if (this.app.settings.getLanguage() === "auto-detect") {
                const language: any = autoDetectLanguageId();
                logger.log("Setting language to", language);
                return this.app.settings.updateLanguage(language);
            }
        })
            .then((): any => {
            document.documentElement.setAttribute("lang", this.app.settings.getLanguage());
        })
            .then((): any => {
            const language: any = this.app.settings.getLanguage();
            updateApplicationLanguage(language);
        })
            .then((): any => this.setStatus("Initializing sounds", 30))
            .then((): any => {
            return this.app.sound.initialize();
        })
            .then((): any => this.setStatus("Initializing restrictions", 34))
            .then((): any => {
            return this.app.restrictionMgr.initialize();
        })
            .then((): any => this.setStatus("Initializing savegames", 38))
            .then((): any => {
            return this.app.savegameMgr.initialize().catch((err: any): any => {
                logger.error("Failed to initialize savegames:", err);
                alert("Your savegames failed to load, it seems your data files got corrupted. I'm so sorry!\n\n(This can happen if your pc crashed while a game was saved).\n\nYou can try re-importing your savegames.");
                return this.app.savegameMgr.writeAsync();
            });
        })
            .then((): any => this.setStatus("Downloading resources", 40))
            .then((): any => {
            this.app.backgroundResourceLoader.resourceStateChangedSignal.add(({ progress }: any): any => {
                this.setStatus("Downloading resources (" + (progress * 100.0).toFixed(1) + " %)", 40 + progress * 50);
            });
            return this.app.backgroundResourceLoader.getMainMenuPromise().catch((err: any): any => {
                logger.error("Failed to load resources:", err);
                this.app.backgroundResourceLoader.showLoaderError(this.dialogs, err);
                return new Promise((): any => null);
            });
        })
            .then((): any => {
            this.app.backgroundResourceLoader.resourceStateChangedSignal.removeAll();
        })
            .then((): any => this.setStatus("Checking changelog", 95))
            .then((): any => {
            if (G_IS_DEV && globalConfig.debug.disableUpgradeNotification) {
                return;
            }
            if (!G_IS_STANDALONE) {
                return;
            }
            return this.app.storage
                .readFileAsync("lastversion.bin")
                .catch((err: any): any => {
                logger.warn("Failed to read lastversion:", err);
                return G_BUILD_VERSION;
            })
                .then((version: any): any => {
                logger.log("Last version:", version, "App version:", G_BUILD_VERSION);
                this.app.storage.writeFileAsync("lastversion.bin", G_BUILD_VERSION);
                return version;
            })
                .then((version: any): any => {
                let changelogEntries: any = [];
                logger.log("Last seen version:", version);
                for (let i: any = 0; i < CHANGELOG.length; ++i) {
                    if (CHANGELOG[i].version === version) {
                        break;
                    }
                    changelogEntries.push(CHANGELOG[i]);
                }
                if (changelogEntries.length === 0) {
                    return;
                }
                let dialogHtml: any = T.dialogs.updateSummary.desc;
                for (let i: any = 0; i < changelogEntries.length; ++i) {
                    const entry: any = changelogEntries[i];
                    dialogHtml += `
                            <div class="changelogDialogEntry" data-changelog-skin="${entry.skin || "default"}">
                                <span class="version">${entry.version}</span>
                                <span class="date">${entry.date}</span>
                                <ul class="changes">
                                    ${entry.entries.map((text: any): any => `<li>${text}</li>`).join("")}
                                </ul>
                            </div>
                        `;
                }
                return new Promise((resolve: any): any => {
                    this.dialogs.showInfo(T.dialogs.updateSummary.title, dialogHtml).ok.add(resolve);
                });
            });
        })
            .then((): any => this.setStatus("Launching", 99))
            .then((): any => {
            this.moveToState("MainMenuState");
        }, (err: any): any => {
            this.showFailMessage(err);
        });
    }
    update(): any {
        const now: any = performance.now();
        if (now - this.lastHintShown > this.nextHintDuration) {
            this.lastHintShown = now;
            const hintText: any = getRandomHint();
            this.hintsText.innerHTML = hintText;
            /**
             * Compute how long the user will need to read the hint.
             * We calculate with 130 words per minute, with an average of 5 chars
             * that is 650 characters / minute
             */
            this.nextHintDuration = Math.max(2500, (hintText.length / 650) * 60 * 1000);
        }
    }
    onRender(): any {
        this.update();
    }
    onBackgroundTick(): any {
        this.update();
    }
        setStatus(text: string, progress: any): any {
        logger.log("✅ " + text);
        this.currentStatus = text;
        this.statusText.innerText = text;
        this.progressElement.style.width = 80 + (progress / 100) * 20 + "%";
        return Promise.resolve();
    }
    showFailMessage(text: any): any {
        logger.error("App init failed:", text);
        const email: any = "bugs@shapez.io";
        const subElement: any = document.createElement("div");
        subElement.classList.add("failureBox");
        subElement.innerHTML = `
                <div class="logo">
                    <img src="${cachebust("res/" + getLogoSprite())}" alt="Shapez.io Logo">
                </div>
                <div class="failureInner">
                    <div class="errorHeader">
                    Failed to initialize application!
                    </div>
                    <div class="errorMessage">
                        ${this.currentStatus} failed:<br/>
                        ${text}
                    </div>
                    <div class="lower">
                        <button class="resetApp styledButton">Reset App</button>
                        <i>Build ${G_BUILD_VERSION} @ ${G_BUILD_COMMIT_HASH}</i>
                    </div>
                </div>
        `;
        this.htmlElement.classList.add("failure");
        this.htmlElement.appendChild(subElement);
        const resetBtn: any = subElement.querySelector("button.resetApp");
        this.trackClicks(resetBtn, this.showResetConfirm);
        this.hintsText.remove();
    }
    showResetConfirm(): any {
        if (confirm("Are you sure you want to reset the app? This will delete all your savegames!")) {
            this.resetApp();
        }
    }
    resetApp(): any {
        this.app.settings
            .resetEverythingAsync()
            .then((): any => {
            this.app.savegameMgr.resetEverythingAsync();
        })
            .then((): any => {
            this.app.settings.resetEverythingAsync();
        })
            .then((): any => {
            window.location.reload();
        });
    }
}
