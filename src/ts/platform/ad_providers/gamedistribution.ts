/* typehints:start */
import type { Application } from "../../application";
/* typehints:end */
import { AdProviderInterface } from "../ad_provider";
import { createLogger } from "../../core/logging";
const minimumTimeBetweenVideoAdsMs: any = G_IS_DEV ? 1 : 5 * 60 * 1000;
const logger: any = createLogger("gamedistribution");
export class GamedistributionAdProvider extends AdProviderInterface {
    public videoAdResolveFunction: Function = null;
    public videoAdResolveTimer = null;
    public lastVideoAdShowTime = -1e20;

        constructor(app) {
        super(app);
    }
    getHasAds(): any {
        return true;
    }
    getCanShowVideoAd(): any {
        return (this.getHasAds() &&
            !this.videoAdResolveFunction &&
            performance.now() - this.lastVideoAdShowTime > minimumTimeBetweenVideoAdsMs);
    }
    initialize(): any {
        // No point to initialize everything if ads are not supported
        if (!this.getHasAds()) {
            return Promise.resolve();
        }
        logger.log("🎬 Initializing gamedistribution ads");
        try {
            parent.postMessage("shapezio://gd.game_loaded", "*");
        }
        catch (ex: any) {
            return Promise.reject("Frame communication not allowed");
        }
        window.addEventListener("message", (event: any): any => {
            if (event.data === "shapezio://gd.ad_started") {
                console.log("🎬 Got ad started callback");
            }
            else if (event.data === "shapezio://gd.ad_finished") {
                console.log("🎬 Got ad finished callback");
                if (this.videoAdResolveFunction) {
                    this.videoAdResolveFunction();
                }
            }
        }, false);
        return Promise.resolve();
    }
    showVideoAd(): any {
        assert(this.getHasAds(), "Called showVideoAd but ads are not supported!");
        assert(!this.videoAdResolveFunction, "Video ad still running, can not show again!");
        this.lastVideoAdShowTime = performance.now();
        console.log("🎬 Gamedistribution: Start ad");
        try {
            parent.postMessage("shapezio://gd.show_ad", "*");
        }
        catch (ex: any) {
            logger.warn("🎬 Failed to send message for gd ad:", ex);
            return Promise.resolve();
        }
        document.body.classList.add("externalAdOpen");
        logger.log("Set sound volume to 0");
        this.app.sound.setMusicVolume(0);
        this.app.sound.setSoundVolume(0);
        return new Promise((resolve: any): any => {
            // So, wait for the remove call but also remove after N seconds
            this.videoAdResolveFunction = (): any => {
                this.videoAdResolveFunction = null;
                clearTimeout(this.videoAdResolveTimer);
                this.videoAdResolveTimer = null;
                // When the ad closed, also set the time
                this.lastVideoAdShowTime = performance.now();
                resolve();
            };
            this.videoAdResolveTimer = setTimeout((): any => {
                logger.warn("Automatically closing ad after not receiving callback");
                if (this.videoAdResolveFunction) {
                    this.videoAdResolveFunction();
                }
            }, 35000);
        })
            .catch((err: any): any => {
            logger.error(this, "Error while resolving video ad:", err);
        })
            .then((): any => {
            document.body.classList.remove("externalAdOpen");
            logger.log("Restored sound volume");
            this.app.sound.setMusicVolume(this.app.settings.getSetting("musicVolume"));
            this.app.sound.setSoundVolume(this.app.settings.getSetting("soundVolume"));
        });
    }
}
