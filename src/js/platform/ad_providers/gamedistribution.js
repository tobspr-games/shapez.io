/* typehints:start */
import { Application } from "../../application";
/* typehints:end */

import { AdProviderInterface } from "../ad_provider";
import { createLogger } from "../../core/logging";

const minimumTimeBetweenVideoAdsMs = G_IS_DEV ? 1 : 5 * 60 * 1000;

const logger = createLogger("gamedistribution");

export class GamedistributionAdProvider extends AdProviderInterface {
    /**
     *
     * @param {Application} app
     */
    constructor(app) {
        super(app);

        /**
         * The resolve function to finish the current video ad. Null if none is currently running
         * @type {Function}
         */
        this.videoAdResolveFunction = null;

        /**
         * The current timer which will timeout the resolve
         */
        this.videoAdResolveTimer = null;

        /**
         * When we showed the last video ad
         */
        this.lastVideoAdShowTime = -1e20;

        console.error("X");
    }

    getHasAds() {
        return true;
    }

    getCanShowVideoAd() {
        return (
            this.getHasAds() &&
            !this.videoAdResolveFunction &&
            performance.now() - this.lastVideoAdShowTime > minimumTimeBetweenVideoAdsMs
        );
    }

    initialize() {
        // No point to initialize everything if ads are not supported
        if (!this.getHasAds()) {
            return Promise.resolve();
        }

        logger.log("🎬 Initializing gamedistribution ads");

        try {
            parent.postMessage("shapezio://gd.game_loaded", "*");
        } catch (ex) {
            return Promise.reject("Frame communication not allowed");
        }

        window.addEventListener(
            "message",
            event => {
                if (event.data === "shapezio://gd.ad_started") {
                    console.log("🎬 Got ad started callback");
                } else if (event.data === "shapezio://gd.ad_finished") {
                    console.log("🎬 Got ad finished callback");
                    if (this.videoAdResolveFunction) {
                        this.videoAdResolveFunction();
                    }
                }
            },
            false
        );

        return Promise.resolve();
    }

    showVideoAd() {
        assert(this.getHasAds(), "Called showVideoAd but ads are not supported!");
        assert(!this.videoAdResolveFunction, "Video ad still running, can not show again!");
        this.lastVideoAdShowTime = performance.now();

        console.log("🎬 Gamedistribution: Start ad");
        try {
            parent.postMessage("shapezio://gd.show_ad", "*");
        } catch (ex) {
            logger.warn("🎬 Failed to send message for gd ad:", ex);
            return Promise.resolve();
        }

        document.body.classList.add("externalAdOpen");

        return new Promise(resolve => {
            // So, wait for the remove call but also remove after N seconds
            this.videoAdResolveFunction = () => {
                this.videoAdResolveFunction = null;
                clearTimeout(this.videoAdResolveTimer);
                this.videoAdResolveTimer = null;

                // When the ad closed, also set the time
                this.lastVideoAdShowTime = performance.now();
                resolve();
            };

            this.videoAdResolveTimer = setTimeout(() => {
                logger.warn("Automatically closing ad after not receiving callback");
                if (this.videoAdResolveFunction) {
                    this.videoAdResolveFunction();
                }
            }, 35000);
        })
            .catch(err => {
                logger.error(this, "Error while resolving video ad:", err);
            })
            .then(() => {
                document.body.classList.remove("externalAdOpen");
            });
    }
}
