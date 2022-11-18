/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
import { IS_MOBILE } from "../core/config";
export class PlatformWrapperInterface {
    public app: Application = app;

    constructor(app) {
    }
    /** {} */
    getId(): string {
        abstract;
        return "unknown-platform";
    }
    /**
     * Returns the UI scale, called on every resize
     * {} */
    getUiScale(): number {
        return 1;
    }
    /** {} */
    getSupportsRestart(): boolean {
        abstract;
        return false;
    }
    /**
     * Returns the strength of touch pans with the mouse
     */
    getTouchPanStrength(): any {
        return 1;
    }
    /** {} */
    initialize(): Promise<void> {
        document.documentElement.classList.add("p-" + this.getId());
        return Promise.resolve();
    }
    /**
     * Should initialize the apps ad provider in case supported
     *  {}
     */
    initializeAdProvider(): Promise<void> {
        return Promise.resolve();
    }
    /**
     * Should return the minimum supported zoom level
     * {}
     */
    getMinimumZoom(): number {
        return 0.1 * this.getScreenScale();
    }
    /**
     * Should return the maximum supported zoom level
     * {}
     */
    getMaximumZoom(): number {
        return 3.5 * this.getScreenScale();
    }
    getScreenScale(): any {
        return Math.min(window.innerWidth, window.innerHeight) / 1024.0;
    }
    /**
     * Should return if this platform supports ads at all
     */
    getSupportsAds(): any {
        return false;
    }
    /**
     * Attempt to open an external url
     * @abstract
     */
    openExternalLink(url: string, force: boolean= = false): any {
        abstract;
    }
    /**
     * Attempt to restart the app
     * @abstract
     */
    performRestart(): any {
        abstract;
    }
    /**
     * Returns whether this platform supports a toggleable fullscreen
     */
    getSupportsFullscreen(): any {
        return false;
    }
    /**
     * Should set the apps fullscreen state to the desired state
     * @abstract
     */
    setFullscreen(flag: boolean): any {
        abstract;
    }
    /**
     * Returns whether this platform supports quitting the app
     */
    getSupportsAppExit(): any {
        return false;
    }
    /**
     * Attempts to quit the app
     * @abstract
     */
    exitApp(): any {
        abstract;
    }
    /**
     * Whether this platform supports a keyboard
     */
    getSupportsKeyboard(): any {
        return !IS_MOBILE;
    }
}
