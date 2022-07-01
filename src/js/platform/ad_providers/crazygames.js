import { AdProviderInterface } from "../ad_provider";
import { createLogger } from "../../core/logging";
import { timeoutPromise } from "../../core/utils";

const logger = createLogger("crazygames");

export class CrazygamesAdProvider extends AdProviderInterface {
    getHasAds() {
        return true;
    }

    getCanShowVideoAd() {
        return this.getHasAds() && this.sdkInstance;
    }

    get sdkInstance() {
        try {
            return window.CrazyGames.CrazySDK.getInstance();
        } catch (ex) {
            return null;
        }
    }

    initialize() {
        if (!this.getHasAds()) {
            return Promise.resolve();
        }

        logger.log("🎬 Initializing crazygames SDK");

        const scriptTag = document.createElement("script");
        scriptTag.type = "text/javascript";

        return timeoutPromise(
            new Promise((resolve, reject) => {
                scriptTag.onload = resolve;
                scriptTag.onerror = reject;
                scriptTag.src = "https://sdk.crazygames.com/crazygames-sdk-v1.js";
                document.head.appendChild(scriptTag);
            })
                .then(() => {
                    logger.log("🎬  Crazygames SDK loaded, now initializing");
                    this.sdkInstance.init();
                })
                .catch(ex => {
                    console.warn("Failed to init crazygames SDK:", ex);
                })
        );
    }

    showVideoAd() {
        const instance = this.sdkInstance;
        if (!instance) {
            return Promise.resolve();
        }

        logger.log("Set sound volume to 0");
        this.app.sound.setMusicVolume(0);
        this.app.sound.setSoundVolume(0);

        return timeoutPromise(
            new Promise(resolve => {
                console.log("🎬 crazygames: Start ad");
                document.body.classList.add("externalAdOpen");

                const finish = () => {
                    instance.removeEventListener("adError", finish);
                    instance.removeEventListener("adFinished", finish);
                    resolve();
                };

                instance.addEventListener("adError", finish);
                instance.addEventListener("adFinished", finish);

                instance.requestAd();
            }),
            60000
        )
            .catch(ex => {
                console.warn("Error while resolving video ad:", ex);
            })
            .then(() => {
                document.body.classList.remove("externalAdOpen");

                logger.log("Restored sound volume");

                this.app.sound.setMusicVolume(this.app.settings.getSetting("musicVolume"));
                this.app.sound.setSoundVolume(this.app.settings.getSetting("soundVolume"));
            });
    }
    setPlayStatus(playing) {
        console.log("crazygames::playing:", playing);
        if (playing) {
            this.sdkInstance.gameplayStart();
        } else {
            this.sdkInstance.gameplayStop();
        }
    }
}
