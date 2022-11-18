/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
export class AdProviderInterface {
    public app = app;

        constructor(app) {
    }
    /**
     * Initializes the storage
     * {}
     */
    initialize(): Promise<void> {
        return Promise.resolve();
    }
    /**
     * Returns if this provider serves ads at all
     * {}
     * @abstract
     */
    getHasAds(): boolean {
        abstract;
        return false;
    }
    /**
     * Returns if it would be possible to show a video ad *now*. This can be false if for
     * example the last video ad is
     * {}
     * @abstract
     */
    getCanShowVideoAd(): boolean {
        abstract;
        return false;
    }
    /**
     * Shows an video ad
     * {}
     */
    showVideoAd(): Promise<void> {
        return Promise.resolve();
    }
    setPlayStatus(playing) { }
}
