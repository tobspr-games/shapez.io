/* typehints:start */
import { Application } from "../application";
import { StateManager } from "./state_manager";
/* typehints:end */

import { globalConfig } from "./config";
import { ClickDetector } from "./click_detector";
import { logSection, createLogger } from "./logging";
import { InputReceiver } from "./input_receiver";
import { waitNextFrame } from "./utils";
import { RequestChannel } from "./request_channel";
import { MUSIC } from "../platform/sound";

const logger = createLogger("game_state");

/**
 * Basic state of the game state machine. This is the base of the whole game
 */
export class GameState {
    /**
     * Constructs a new state with the given id
     * @param {string} key The id of the state. We use ids to refer to states because otherwise we get
     *                     circular references
     */
    constructor(key) {
        this.key = key;

        /** @type {StateManager} */
        this.stateManager = null;

        /** @type {Application} */
        this.app = null;

        // Store if we are currently fading out
        this.fadingOut = false;

        /** @type {Array<ClickDetector>} */
        this.clickDetectors = [];

        // Every state captures keyboard events by default
        this.inputReciever = new InputReceiver("state-" + key);
        this.inputReciever.backButton.add(this.onBackButton, this);

        // A channel we can use to perform async ops
        this.asyncChannel = new RequestChannel();
    }

    //// GETTERS / HELPER METHODS ////

    /**
     * Returns the states key
     * @returns {string}
     */
    getKey() {
        return this.key;
    }

    /**
     * Returns the html element of the state
     * @returns {HTMLElement}
     */
    getDivElement() {
        return document.getElementById("state_" + this.key);
    }

    /**
     * Transfers to a new state
     * @param {string} stateKey The id of the new state
     */
    moveToState(stateKey, payload = {}, skipFadeOut = false) {
        if (this.fadingOut) {
            logger.warn("Skipping move to '" + stateKey + "' since already fading out");
            return;
        }

        // Clean up event listeners
        this.internalCleanUpClickDetectors();

        // Fading
        const fadeTime = this.internalGetFadeInOutTime();
        const doFade = !skipFadeOut && this.getHasFadeOut() && fadeTime !== 0;
        logger.log("Moving to", stateKey, "(fading=", doFade, ")");
        if (doFade) {
            this.htmlElement.classList.remove("arrived");
            this.fadingOut = true;
            setTimeout(() => {
                this.stateManager.moveToState(stateKey, payload);
            }, fadeTime);
        } else {
            this.stateManager.moveToState(stateKey, payload);
        }
    }

    /**
     * Tracks clicks on a given element and calls the given callback *on this state*.
     * If you want to call another function wrap it inside a lambda.
     * @param {Element} element The element to track clicks on
     * @param {function():void} handler The handler to call
     * @param {import("./click_detector").ClickDetectorConstructorArgs=} args Click detector arguments
     */
    trackClicks(element, handler, args = {}) {
        const detector = new ClickDetector(element, args);
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
    cancelAllAsyncOperations() {
        this.asyncChannel.cancelAll();
    }

    //// CALLBACKS ////

    /**
     * Callback when entering the state, to be overriddemn
     * @param {any} payload Arbitrary data passed from the state which we are transferring from
     */
    onEnter(payload) {}

    /**
     * Callback when leaving the state
     */
    onLeave() {}

    /**
     * Callback when the app got paused (on android, this means in background)
     */
    onAppPause() {}

    /**
     * Callback when the app got resumed (on android, this means in foreground again)
     */
    onAppResume() {}

    /**
     * Render callback
     * @param {number} dt Delta time in ms since last render
     */
    onRender(dt) {}

    /**
     * Background tick callback, called while the game is inactiev
     * @param {number} dt Delta time in ms since last tick
     */
    onBackgroundTick(dt) {}

    /**
     * Called when the screen resized
     * @param {number} w window/screen width
     * @param {number} h window/screen height
     */
    onResized(w, h) {}

    /**
     * Internal backbutton handler, called when the hardware back button is pressed or
     * the escape key is pressed
     */
    onBackButton() {}

    //// INTERFACE ////

    /**
     * Should return how many mulliseconds to fade in / out the state. Not recommended to override!
     * @returns {number} Time in milliseconds to fade out
     */
    getInOutFadeTime() {
        if (globalConfig.debug.noArtificialDelays) {
            return 0;
        }
        return 200;
    }

    /**
     * Should return whether to fade in the game state. This will then apply the right css classes
     * for the fadein.
     * @returns {boolean}
     */
    getHasFadeIn() {
        return true;
    }

    /**
     * Should return whether to fade out the game state. This will then apply the right css classes
     * for the fadeout and wait the delay before moving states
     * @returns {boolean}
     */
    getHasFadeOut() {
        return true;
    }

    /**
     * Returns if this state should get paused if it does not have focus
     * @returns {boolean} true to pause the updating of the game
     */
    getPauseOnFocusLost() {
        return true;
    }

    /**
     * Should return the html code of the state.
     * @returns {string}
     * @abstract
     */
    getInnerHTML() {
        abstract;
        return "";
    }

    /**
     * Returns if the state has an unload confirmation, this is the
     * "Are you sure you want to leave the page" message.
     */
    getHasUnloadConfirmation() {
        return false;
    }

    /**
     * Should return the theme music for this state
     * @returns {string|null}
     */
    getThemeMusic() {
        return MUSIC.menu;
    }

    /**
     * Should return whether to clear the whole body content before entering the state.
     * @returns {boolean}
     */
    getRemovePreviousContent() {
        return true;
    }

    ////////////////////

    //// INTERNAL ////

    /**
     * Internal callback from the manager. Do not override!
     * @param {StateManager} stateManager
     */
    internalRegisterCallback(stateManager, app) {
        assert(stateManager, "No state manager");
        assert(app, "No app");
        this.stateManager = stateManager;
        this.app = app;
    }

    /**
     * Internal callback when entering the state. Do not override!
     * @param {any} payload Arbitrary data passed from the state which we are transferring from
     * @param {boolean} callCallback Whether to call the onEnter callback
     */
    internalEnterCallback(payload, callCallback = true) {
        logSection(this.key, "#26a69a");
        this.app.inputMgr.pushReciever(this.inputReciever);

        this.htmlElement = this.getDivElement();
        this.htmlElement.classList.add("active");

        // Apply classes in the next frame so the css transition keeps up
        waitNextFrame().then(() => {
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
    internalLeaveCallback() {
        this.onLeave();

        this.htmlElement.classList.remove("active");
        this.app.inputMgr.popReciever(this.inputReciever);
        this.internalCleanUpClickDetectors();
        this.asyncChannel.cancelAll();
    }

    /**
     * Internal app pause callback
     */
    internalOnAppPauseCallback() {
        this.onAppPause();
    }

    /**
     * Internal app resume callback
     */
    internalOnAppResumeCallback() {
        this.onAppResume();
    }

    /**
     * Cleans up all click detectors
     */
    internalCleanUpClickDetectors() {
        if (this.clickDetectors) {
            for (let i = 0; i < this.clickDetectors.length; ++i) {
                this.clickDetectors[i].cleanup();
            }
            this.clickDetectors = [];
        }
    }

    /**
     * Internal method to get the HTML of the game state.
     * @returns {string}
     */
    internalGetFullHtml() {
        return this.getInnerHTML();
    }

    /**
     * Internal method to compute the time to fade in / out
     * @returns {number} time to fade in / out in ms
     */
    internalGetFadeInOutTime() {
        if (G_IS_DEV && globalConfig.debug.fastGameEnter) {
            return 1;
        }
        if (G_IS_DEV && globalConfig.debug.noArtificialDelays) {
            return 1;
        }
        return this.getInOutFadeTime();
    }
}
