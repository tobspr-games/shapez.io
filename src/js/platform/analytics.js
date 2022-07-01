/* typehints:start */
import { Application } from "../application";
/* typehints:end */

export class AnalyticsInterface {
    constructor(app) {
        /** @type {Application} */
        this.app = app;
    }

    /**
     * Initializes the analytics
     * @returns {Promise<void>}
     * @abstract
     */
    initialize() {
        abstract;
        return Promise.reject();
    }

    /**
     * Sets the player name for analytics
     * @param {string} userName
     */
    setUserContext(userName) {}

    /**
     * Tracks when a new state is entered
     * @param {string} stateId
     */
    trackStateEnter(stateId) {}

    /**
     * Tracks a new user decision
     * @param {string} name
     */
    trackDecision(name) {}

    // LEGACY 1.5.3
    trackUiClick() {}
}
