import { globalConfig, IS_MOBILE } from "../../core/config";
import { createLogger } from "../../core/logging";
import { queryParamOptions } from "../../core/query_parameters";
import { WEB_STEAM_SSO_AUTHENTICATED } from "../../core/steam_sso";
import { clamp } from "../../core/utils";
import { CrazygamesAdProvider } from "../ad_providers/crazygames";
import { GamedistributionAdProvider } from "../ad_providers/gamedistribution";
import { NoAdProvider } from "../ad_providers/no_ad_provider";
import { SteamAchievementProvider } from "../electron/steam_achievement_provider";
import { PlatformWrapperInterface } from "../wrapper";
import { NoAchievementProvider } from "./no_achievement_provider";
import { StorageImplBrowser } from "./storage";
import { StorageImplBrowserIndexedDB } from "./storage_indexed_db";
const logger: any = createLogger("platform/browser");
export class PlatformWrapperImplBrowser extends PlatformWrapperInterface {
    initialize(): any {
        this.recaptchaTokenCallback = null;
        this.embedProvider = {
            id: "shapezio-website",
            adProvider: NoAdProvider,
            iframed: false,
            externalLinks: true,
        };
        if (!G_IS_STANDALONE && !WEB_STEAM_SSO_AUTHENTICATED && queryParamOptions.embedProvider) {
            const providerId: any = queryParamOptions.embedProvider;
            this.embedProvider.iframed = true;
            switch (providerId) {
                case "armorgames": {
                    this.embedProvider.id = "armorgames";
                    break;
                }
                case "iogames.space": {
                    this.embedProvider.id = "iogames.space";
                    break;
                }
                case "miniclip": {
                    this.embedProvider.id = "miniclip";
                    break;
                }
                case "gamedistribution": {
                    this.embedProvider.id = "gamedistribution";
                    this.embedProvider.externalLinks = false;
                    this.embedProvider.adProvider = GamedistributionAdProvider;
                    break;
                }
                case "kongregate": {
                    this.embedProvider.id = "kongregate";
                    break;
                }
                case "crazygames": {
                    this.embedProvider.id = "crazygames";
                    this.embedProvider.adProvider = CrazygamesAdProvider;
                    break;
                }
                default: {
                    logger.error("Got unsupported embed provider:", providerId);
                }
            }
        }
        logger.log("Embed provider:", this.embedProvider.id);
        return this.detectStorageImplementation()
            .then((): any => this.initializeAdProvider())
            .then((): any => this.initializeAchievementProvider())
            .then((): any => super.initialize());
    }
    detectStorageImplementation(): any {
        return new Promise((resolve: any): any => {
            logger.log("Detecting storage");
            if (!window.indexedDB) {
                logger.log("Indexed DB not supported");
                this.app.storage = new StorageImplBrowser(this.app);
                resolve();
                return;
            }
            // Try accessing the indexedb
            let request: any;
            try {
                request = window.indexedDB.open("indexeddb_feature_detection", 1);
            }
            catch (ex: any) {
                logger.warn("Error while opening indexed db:", ex);
                this.app.storage = new StorageImplBrowser(this.app);
                resolve();
                return;
            }
            request.onerror = (err: any): any => {
                logger.log("Indexed DB can *not* be accessed: ", err);
                logger.log("Using fallback to local storage");
                this.app.storage = new StorageImplBrowser(this.app);
                resolve();
            };
            request.onsuccess = (): any => {
                logger.log("Indexed DB *can* be accessed");
                this.app.storage = new StorageImplBrowserIndexedDB(this.app);
                resolve();
            };
        });
    }
    getId(): any {
        return "browser@" + this.embedProvider.id;
    }
    getUiScale(): any {
        if (IS_MOBILE) {
            return 1;
        }
        const avgDims: any = Math.min(this.app.screenWidth, this.app.screenHeight);
        return clamp((avgDims / 1000.0) * 1.9, 0.1, 10);
    }
    getSupportsRestart(): any {
        return true;
    }
    getTouchPanStrength(): any {
        return IS_MOBILE ? 1 : 0.5;
    }
    openExternalLink(url: any, force: any = false): any {
        logger.log("Opening external:", url);
        window.open(url);
    }
    performRestart(): any {
        logger.log("Performing restart");
        window.location.reload(true);
    }
    /**
     * Detects if there is an adblocker installed
     * {}
     */
    detectAdblock(): Promise<boolean> {
        return Promise.race([
            new Promise((resolve: any): any => {
                // If the request wasn't blocked within a very short period of time, this means
                // the adblocker is not active and the request was actually made -> ignore it then
                setTimeout((): any => resolve(false), 30);
            }),
            new Promise((resolve: any): any => {
                fetch("https://googleads.g.doubleclick.net/pagead/id", {
                    method: "HEAD",
                    mode: "no-cors",
                })
                    .then((res: any): any => {
                    resolve(false);
                })
                    .catch((err: any): any => {
                    resolve(true);
                });
            }),
        ]);
    }
    initializeAdProvider(): any {
        if (G_IS_DEV && !globalConfig.debug.testAds) {
            logger.log("Ads disabled in local environment");
            return Promise.resolve();
        }
        // First, detect adblocker
        return this.detectAdblock().then((hasAdblocker: any): any => {
            if (hasAdblocker) {
                logger.log("Adblock detected");
                return;
            }
            const adProvider: any = this.embedProvider.adProvider;
            this.app.adProvider = new adProvider(this.app);
            return this.app.adProvider.initialize().catch((err: any): any => {
                logger.error("Failed to initialize ad provider, disabling ads:", err);
                this.app.adProvider = new NoAdProvider(this.app);
            });
        });
    }
    initializeAchievementProvider(): any {
        if (G_IS_DEV && globalConfig.debug.testAchievements) {
            this.app.achievementProvider = new SteamAchievementProvider(this.app);
            return this.app.achievementProvider.initialize().catch((err: any): any => {
                logger.error("Failed to initialize achievement provider, disabling:", err);
                this.app.achievementProvider = new NoAchievementProvider(this.app);
            });
        }
        return this.app.achievementProvider.initialize();
    }
    exitApp(): any {
        // Can not exit app
    }
}
