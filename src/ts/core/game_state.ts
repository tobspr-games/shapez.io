/* typehints:start */
import type { Application } from "../application";
import type { StateManager } from "./state_manager";
/* typehints:end */
import { globalConfig } from "./config";
import { ClickDetector } from "./click_detector";
import { logSection, createLogger } from "./logging";
import { InputReceiver } from "./input_receiver";
import { waitNextFrame } from "./utils";
import { RequestChannel } from "./request_channel";
import { MUSIC } from "../platform/sound";
const logger: any = createLogger("game_state");
/**
 * Basic state of the game state machine. This is the base of the whole game
 */
export class GameState {
    public key = key;
    public stateManager: StateManager = null;
    public app: Application = null;
    public fadingOut = false;
    public clickDetectors: Array<ClickDetector> = [];
    public inputReciever = new InputReceiver("state-" + key);
    public asyncChannel = new RequestChannel();
    /**
     * Constructs a new state with the given id
     */

    constructor(key) {
        this.inputReciever.backButton.add(this.onBackButton, this);
    }
    //// GETTERS / HELPER METHODS ////
    /**
     * Returns the states key
     * {}
     */
    getKey(): string {
        return this.key;
    }
    /**
     * Returns the html element of the state
     * {}
     */
    getDivElement(): HTMLElement {
        return document.getElementById("state_" + this.key);
    }
    /**
     * Transfers to a new state
     */
    moveToState(stateKey: string, payload: any = {}, skipFadeOut: any = false): any {
        if (this.fadingOut) {
            logger.warn("Skipping move to '" + stateKey + "' since already fading out");
            return;
        }
        // Clean up event listeners
        this.internalCleanUpClickDetectors();
        // Fading
        const fadeTime: any = this.internalGetFadeInOutTime();
        const doFade: any = !skipFadeOut && this.getHasFadeOut() && fadeTime !== 0;
        logger.log("Moving to", stateKey, "(fading=", doFade, ")");
        if (doFade) {
            this.htmlElement.classList.remove("arrived");
            this.fadingOut = true;
            setTimeout((): any => {
                this.stateManager.moveToState(stateKey, payload);
            }, fadeTime);
        }
        else {
            this.stateManager.moveToState(stateKey, payload);
        }
    }
    /**
     * Tracks clicks on a given element and calls the given callback *on this state*.
     * If you want to call another function wrap it inside a lambda.
     */
    trackClicks(element: Element, handler: function():void, args: import("./click_detector").ClickDetectorConstructorArgs= = {}): any {
        const detector: any = new ClickDetector(element, args);
        detector.click.add(handler, this);
        if (G_IS_DEV) {
            // Append a source so we can check where the click detector is from
            // @ts-ignore
            detector._src = "state-" + this.key;
        }
        this.clickDetectors.push(detector);
    }
    /**
     * Cancels all promises on the api as well as our async channel
     */
    cancelAllAsyncOperations(): any {
        this.asyncChannel.cancelAll();
    }
    //// CALLBACKS ////
    /**
     * Callback when entering the state, to be overriddemn
     */
    onEnter(payload: any): any { }
    /**
     * Callback when leaving the state
     */
    onLeave(): any { }
    /**
     * Callback when the app got paused (on android, this means in background)
     */
    onAppPause(): any { }
    /**
     * Callback when the app got resumed (on android, this means in foreground again)
     */
    onAppResume(): any { }
    /**
     * Render callback
     */
    onRender(dt: number): any { }
    /**
     * Background tick callback, called while the game is inactiev
     */
    onBackgroundTick(dt: number): any { }
    /**
     * Called when the screen resized
     */
    onResized(w: number, h: number): any { }
    /**
     * Internal backbutton handler, called when the hardware back button is pressed or
     * the escape key is pressed
     */
    onBackButton(): any { }
    //// INTERFACE ////
    /**
     * Should return how many mulliseconds to fade in / out the state. Not recommended to override!
     * {} Time in milliseconds to fade out
     */
    getInOutFadeTime(): number {
        if (globalConfig.debug.noArtificialDelays) {
            return 0;
        }
        return 200;
    }
    /**
     * Should return whether to fade in the game state. This will then apply the right css classes
     * for the fadein.
     * {}
     */
    getHasFadeIn(): boolean {
        return true;
    }
    /**
     * Should return whether to fade out the game state. This will then apply the right css classes
     * for the fadeout and wait the delay before moving states
     * {}
     */
    getHasFadeOut(): boolean {
        return true;
    }
    /**
     * Returns if this state should get paused if it does not have focus
     * {} true to pause the updating of the game
     */
    getPauseOnFocusLost(): boolean {
        return true;
    }
    /**
     * Should return the html code of the state.
     * {}
     * @abstract
     */
    getInnerHTML(): string {
        abstract;
        return "";
    }
    /**
     * Returns if the state has an unload confirmation, this is the
     * "Are you sure you want to leave the page" message.
     */
    getHasUnloadConfirmation(): any {
        return false;
    }
    /**
     * Should return the theme music for this state
     * {}
     */
    getThemeMusic(): string | null {
        return MUSIC.menu;
    }
    /**
     * Should return true if the player is currently ingame
     * {}
     */
    getIsIngame(): boolean {
        return false;
    }
    /**
     * Should return whether to clear the whole body content before entering the state.
     * {}
     */
    getRemovePreviousContent(): boolean {
        return true;
    }
    ////////////////////
    //// INTERNAL ////
    /**
     * Internal callback from the manager. Do not override!
     */
    internalRegisterCallback(stateManager: StateManager, app: any): any {
        assert(stateManager, "No state manager");
        assert(app, "No app");
        this.stateManager = stateManager;
        this.app = app;
    }
    /**
     * Internal callback when entering the state. Do not override!
     */
    internalEnterCallback(payload: any, callCallback: boolean = true): any {
        logSection(this.key, "#26a69a");
        this.app.inputMgr.pushReciever(this.inputReciever);
        this.htmlElement = this.getDivElement();
        this.htmlElement.classList.add("active");
        // Apply classes in the next frame so the css transition keeps up
        waitNextFrame().then((): any => {
            if (this.htmlElement) {
                this.htmlElement.classList.remove("fadingOut");
                this.htmlElement.classList.remove("fadingIn");
            }
        });
        // Call handler
        if (callCallback) {
            this.onEnter(payload);
        }
    }
    /**
     * Internal callback when the state is left. Do not override!
     */
    internalLeaveCallback(): any {
        this.onLeave();
        this.htmlElement.classList.remove("active");
        this.app.inputMgr.popReciever(this.inputReciever);
        this.internalCleanUpClickDetectors();
        this.asyncChannel.cancelAll();
    }
    /**
     * Internal app pause callback
     */
    internalOnAppPauseCallback(): any {
        this.onAppPause();
    }
    /**
     * Internal app resume callback
     */
    internalOnAppResumeCallback(): any {
        this.onAppResume();
    }
    /**
     * Cleans up all click detectors
     */
    internalCleanUpClickDetectors(): any {
        if (this.clickDetectors) {
            for (let i: any = 0; i < this.clickDetectors.length; ++i) {
                this.clickDetectors[i].cleanup();
            }
            this.clickDetectors = [];
        }
    }
    /**
     * Internal method to get the HTML of the game state.
     * {}
     */
    internalGetFullHtml(): string {
        return this.getInnerHTML();
    }
    /**
     * Internal method to compute the time to fade in / out
     * {} time to fade in / out in ms
     */
    internalGetFadeInOutTime(): number {
        if (G_IS_DEV && globalConfig.debug.fastGameEnter) {
            return 1;
        }
        if (G_IS_DEV && globalConfig.debug.noArtificialDelays) {
            return 1;
        }
        return this.getInOutFadeTime();
    }
}
