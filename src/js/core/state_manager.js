/* typehints:start*/
import { Application } from "../application";
/* typehints:end*/

import { GameState } from "./game_state";
import { createLogger } from "./logging";
import { APPLICATION_ERROR_OCCURED } from "./error_handler";
import { waitNextFrame, removeAllChildren } from "./utils";

const logger = createLogger("state_manager");

/**
 * This is the main state machine which drives the game states.
 */
export class StateManager {
    /**
     * @param {Application} app
     */
    constructor(app) {
        this.app = app;

        /** @type {GameState} */
        this.currentState = null;

        /** @type {Object.<string, new() => GameState>} */
        this.stateClasses = {};
    }

    /**
     * Registers a new state class, should be a GameState derived class
     * @param {object} stateClass
     */
    register(stateClass) {
        // Create a dummy to retrieve the key
        const dummy = new stateClass();
        assert(dummy instanceof GameState, "Not a state!");
        const key = dummy.getKey();
        assert(!this.stateClasses[key], `State '${key}' is already registered!`);
        this.stateClasses[key] = stateClass;
    }

    /**
     * Constructs a new state or returns the instance from the cache
     * @param {string} key
     */
    constructState(key) {
        if (this.stateClasses[key]) {
            return new this.stateClasses[key]();
        }
        assert(false, `State '${key}' is not known!`);
    }

    /**
     * Moves to a given state
     * @param {string} key State Key
     */
    moveToState(key, payload = {}) {
        if (APPLICATION_ERROR_OCCURED) {
            console.warn("Skipping state transition because of application crash");
            return;
        }

        if (this.currentState) {
            if (key === this.currentState.getKey()) {
                logger.error(`State '${key}' is already active!`);
                return false;
            }
            this.currentState.internalLeaveCallback();

            // Remove all references
            for (const stateKey in this.currentState) {
                if (this.currentState.hasOwnProperty(stateKey)) {
                    delete this.currentState[stateKey];
                }
            }
            this.currentState = null;
        }

        this.currentState = this.constructState(key);
        this.currentState.internalRegisterCallback(this, this.app);

        // Clean up old elements
        removeAllChildren(document.body);

        document.body.className = "gameState " + (this.currentState.getHasFadeIn() ? "" : "arrived");
        document.body.id = "state_" + key;
        document.body.innerHTML = this.currentState.internalGetFullHtml();

        const dialogParent = document.createElement("div");
        dialogParent.classList.add("modalDialogParent");
        document.body.appendChild(dialogParent);

        this.app.sound.playThemeMusic(this.currentState.getThemeMusic());

        this.currentState.internalEnterCallback(payload);
        this.currentState.onResized(this.app.screenWidth, this.app.screenHeight);

        this.app.analytics.trackStateEnter(key);

        window.history.pushState({
                key,
            },
            key
        );

        waitNextFrame().then(() => {
            document.body.classList.add("arrived");
        });

        return true;
    }

    /**
     * Returns the current state
     * @returns {GameState}
     */
    getCurrentState() {
        return this.currentState;
    }
}