/* typehints:start */
import { Application } from "../application";
/* typehints:end */

export class AdProviderInterface {
    /** @param {Application} app */
    constructor(app) {
        this.app = app;
    }

    /**
     * Initializes the storage
     * @returns {Promise<void>}
     */
    initialize() {
        return Promise.resolve();
    }

    /**
     * Returns if this provider serves ads at all
     * @returns {boolean}
     */
    getHasAds() {
        abstract;
        return false;
    }

    /**
     * Returns if it would be possible to show a video ad *now*. This can be false if for
     * example the last video ad is
     * @returns {boolean}
     */
    getCanShowVideoAd() {
        abstract;
        return false;
    }

    /**
     * Shows an video ad
     * @returns {Promise<void>}
     */
    showVideoAd() {
        return Promise.resolve();
    }
}
