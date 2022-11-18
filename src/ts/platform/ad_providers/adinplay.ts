/* typehints:start */
import type { Application } from "../../application";
/* typehints:end */
import { AdProviderInterface } from "../ad_provider";
import { createLogger } from "../../core/logging";
import { ClickDetector } from "../../core/click_detector";
import { clamp } from "../../core/utils";
import { T } from "../../translations";
const logger: any = createLogger("adprovider/adinplay");
const minimumTimeBetweenVideoAdsMs: any = G_IS_DEV ? 1 : 15 * 60 * 1000;
export class AdinplayAdProvider extends AdProviderInterface {
    public getOnSteamClickDetector: ClickDetector = null;
    public adContainerMainElement: Element = null;
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
        logger.log("🎬 Initializing Adinplay");
        // Add the preroll element
        this.adContainerMainElement = document.createElement("div");
        this.adContainerMainElement.id = "adinplayVideoContainer";
        this.adContainerMainElement.innerHTML = `
            <div class="adInner">
                <div class="videoInner">

                </div>
            </div>
        `;
        // Add the setup script
        const setupScript: any = document.createElement("script");
        setupScript.textContent = `
            var aiptag = aiptag || {};
            aiptag.cmd = aiptag.cmd || [];
            aiptag.cmd.display = aiptag.cmd.display || [];
            aiptag.cmd.player = aiptag.cmd.player || [];
        `;
        document.head.appendChild(setupScript);
        window.aiptag.gdprShowConsentTool = 0;
        window.aiptag.gdprAlternativeConsentTool = 1;
        window.aiptag.gdprConsent = 1;
        const scale: any = this.app.getEffectiveUiScale();
        const targetW: any = 960;
        const targetH: any = 540;
        const maxScaleX: any = (window.innerWidth - 100 * scale) / targetW;
        const maxScaleY: any = (window.innerHeight - 150 * scale) / targetH;
        const scaleFactor: any = clamp(Math.min(maxScaleX, maxScaleY), 0.25, 2);
        const w: any = Math.round(targetW * scaleFactor);
        const h: any = Math.round(targetH * scaleFactor);
        // Add the player
        const videoElement: any = this.adContainerMainElement.querySelector(".videoInner");
                const adInnerElement: HTMLElement = this.adContainerMainElement.querySelector(".adInner");
        adInnerElement.style.maxWidth = w + "px";
        const self: any = this;
        window.aiptag.cmd.player.push(function (): any {
            window.adPlayer = new window.aipPlayer({
                AD_WIDTH: w,
                AD_HEIGHT: h,
                AD_FULLSCREEN: false,
                AD_CENTERPLAYER: false,
                LOADING_TEXT: T.global.loading,
                PREROLL_ELEM: function (): any {
                    return videoElement;
                },
                AIP_COMPLETE: function (): any {
                    logger.log("🎬 ADINPLAY AD: completed");
                    self.adContainerMainElement.classList.add("waitingForFinish");
                },
                AIP_REMOVE: function (): any {
                    logger.log("🎬 ADINPLAY AD: remove");
                    if (self.videoAdResolveFunction) {
                        self.videoAdResolveFunction();
                    }
                },
            });
        });
        // Load the ads
        const aipScript: any = document.createElement("script");
        aipScript.src = "https://api.adinplay.com/libs/aiptag/pub/YRG/shapez.io/tag.min.js";
        aipScript.setAttribute("async", "");
        document.head.appendChild(aipScript);
        return Promise.resolve();
    }
    showVideoAd(): any {
        assert(this.getHasAds(), "Called showVideoAd but ads are not supported!");
        assert(!this.videoAdResolveFunction, "Video ad still running, can not show again!");
        this.lastVideoAdShowTime = performance.now();
        document.body.appendChild(this.adContainerMainElement);
        this.adContainerMainElement.classList.add("visible");
        this.adContainerMainElement.classList.remove("waitingForFinish");
        try {
            // @ts-ignore
            window.aiptag.cmd.player.push(function (): any {
                console.log("🎬 ADINPLAY AD: Start pre roll");
                window.adPlayer.startPreRoll();
            });
        }
        catch (ex: any) {
            logger.warn("🎬 Failed to play video ad:", ex);
            document.body.removeChild(this.adContainerMainElement);
            this.adContainerMainElement.classList.remove("visible");
            return Promise.resolve();
        }
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
                logger.warn(this, "Automatically closing ad after not receiving callback");
                if (this.videoAdResolveFunction) {
                    this.videoAdResolveFunction();
                }
            }, 120 * 1000);
        })
            .catch((err: any): any => {
            logger.error("Error while resolving video ad:", err);
        })
            .then((): any => {
            document.body.removeChild(this.adContainerMainElement);
            this.adContainerMainElement.classList.remove("visible");
        });
    }
}
