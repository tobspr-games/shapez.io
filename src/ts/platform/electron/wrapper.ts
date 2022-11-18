import { NoAchievementProvider } from "../browser/no_achievement_provider";
import { PlatformWrapperImplBrowser } from "../browser/wrapper";
import { createLogger } from "../../core/logging";
import { StorageImplElectron } from "./storage";
import { SteamAchievementProvider } from "./steam_achievement_provider";
import { PlatformWrapperInterface } from "../wrapper";
const logger: any = createLogger("electron-wrapper");
export class PlatformWrapperImplElectron extends PlatformWrapperImplBrowser {
    initialize(): any {
        this.dlcs = {
            puzzle: false,
        };
        this.steamOverlayCanvasFix = document.createElement("canvas");
        this.steamOverlayCanvasFix.width = 1;
        this.steamOverlayCanvasFix.height = 1;
        this.steamOverlayCanvasFix.id = "steamOverlayCanvasFix";
        this.steamOverlayContextFix = this.steamOverlayCanvasFix.getContext("2d");
        document.documentElement.appendChild(this.steamOverlayCanvasFix);
        this.app.ticker.frameEmitted.add(this.steamOverlayFixRedrawCanvas, this);
        this.app.storage = new StorageImplElectron(this);
        this.app.achievementProvider = new SteamAchievementProvider(this.app);
        return this.initializeAchievementProvider()
            .then((): any => this.initializeDlcStatus())
            .then((): any => PlatformWrapperInterface.prototype.initialize.call(this));
    }
    steamOverlayFixRedrawCanvas(): any {
        this.steamOverlayContextFix.clearRect(0, 0, 1, 1);
    }
    getId(): any {
        return "electron";
    }
    getSupportsRestart(): any {
        return true;
    }
    openExternalLink(url: any): any {
        logger.log(this, "Opening external:", url);
        window.open(url, "about:blank");
    }
    getSupportsAds(): any {
        return false;
    }
    performRestart(): any {
        logger.log(this, "Performing restart");
        window.location.reload(true);
    }
    initializeAdProvider(): any {
        return Promise.resolve();
    }
    initializeAchievementProvider(): any {
        return this.app.achievementProvider.initialize().catch((err: any): any => {
            logger.error("Failed to initialize achievement provider, disabling:", err);
            this.app.achievementProvider = new NoAchievementProvider(this.app);
        });
    }
    initializeDlcStatus(): any {
        logger.log("Checking DLC ownership ...");
        // @todo: Don't hardcode the app id
        return ipcRenderer.invoke("steam:check-app-ownership", 1625400).then((res: any): any => {
            logger.log("Got DLC ownership:", res);
            this.dlcs.puzzle = Boolean(res);
            if (this.dlcs.puzzle && !G_IS_DEV) {
                this.app.gameAnalytics.activateDlc("puzzle").then((): any => {
                    logger.log("Puzzle DLC successfully activated");
                }, (error: any): any => {
                    logger.error("Failed to activate puzzle DLC:", error);
                });
            }
        }, (err: any): any => {
            logger.error("Failed to get DLC ownership:", err);
        });
    }
    getSupportsFullscreen(): any {
        return true;
    }
    setFullscreen(flag: any): any {
        ipcRenderer.send("set-fullscreen", flag);
    }
    getSupportsAppExit(): any {
        return true;
    }
    exitApp(): any {
        logger.log(this, "Sending app exit signal");
        ipcRenderer.send("exit-app");
    }
}
