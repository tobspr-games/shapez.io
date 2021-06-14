import { NoAchievementProvider } from "../browser/no_achievement_provider";
import { PlatformWrapperImplBrowser } from "../browser/wrapper";
import { getIPCRenderer } from "../../core/utils";
import { createLogger } from "../../core/logging";
import { StorageImplElectron } from "./storage";
import { SteamAchievementProvider } from "./steam_achievement_provider";
import { PlatformWrapperInterface } from "../wrapper";

const logger = createLogger("electron-wrapper");

export class PlatformWrapperImplElectron extends PlatformWrapperImplBrowser {
    initialize() {
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
            .then(() => this.initializeDlcStatus())
            .then(() => PlatformWrapperInterface.prototype.initialize.call(this));
    }

    steamOverlayFixRedrawCanvas() {
        this.steamOverlayContextFix.clearRect(0, 0, 1, 1);
    }

    getId() {
        return "electron";
    }

    getSupportsRestart() {
        return true;
    }

    openExternalLink(url) {
        logger.log(this, "Opening external:", url);
        window.open(url, "about:blank");
    }

    getSupportsAds() {
        return false;
    }

    performRestart() {
        logger.log(this, "Performing restart");
        window.location.reload(true);
    }

    initializeAdProvider() {
        return Promise.resolve();
    }

    initializeAchievementProvider() {
        return this.app.achievementProvider.initialize().catch(err => {
            logger.error("Failed to initialize achievement provider, disabling:", err);

            this.app.achievementProvider = new NoAchievementProvider(this.app);
        });
    }

    initializeDlcStatus() {
        const renderer = getIPCRenderer();

        if (G_WEGAME_VERSION) {
            return Promise.resolve();
        }

        logger.log("Checking DLC ownership ...");
        // @todo: Don't hardcode the app id
        return renderer.invoke("steam:check-app-ownership", 1625400).then(
            res => {
                logger.log("Got DLC ownership:", res);
                this.dlcs.puzzle = Boolean(res);
            },
            err => {
                logger.error("Failed to get DLC ownership:", err);
            }
        );
    }

    getSupportsFullscreen() {
        return true;
    }

    setFullscreen(flag) {
        getIPCRenderer().send("set-fullscreen", flag);
    }

    getSupportsAppExit() {
        return true;
    }

    exitApp() {
        logger.log(this, "Sending app exit signal");
        getIPCRenderer().send("exit-app");
    }
}
