import { PlatformWrapperImplBrowser } from "../browser/wrapper";
import { getIPCRenderer } from "../../core/utils";
import { createLogger } from "../../core/logging";
import { StorageImplElectron } from "./storage";
import { PlatformWrapperInterface } from "../wrapper";

const logger = createLogger("electron-wrapper");

export class PlatformWrapperImplElectron extends PlatformWrapperImplBrowser {
    initialize() {
        this.app.storage = new StorageImplElectron(this);
        return PlatformWrapperInterface.prototype.initialize.call(this);
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

    getHasUnlimitedSavegames() {
        return true;
    }

    getShowDemoBadges() {
        return false;
    }

    performRestart() {
        logger.log(this, "Performing restart");
        window.location.reload(true);
    }

    initializeAdProvider() {
        return Promise.resolve();
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
