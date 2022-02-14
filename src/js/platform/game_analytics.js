/**
 * @typedef {import("../application").Application} Application
 */

export class GameAnalyticsInterface {
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
     * Handles a new game which was started
     */
    handleGameStarted() {}

    /**
     * Handles a resumed game
     */
    handleGameResumed() {}

    /**
     * Handles the given level completed
     * @param {number} level
     */
    handleLevelCompleted(level) {}

    /**
     * Handles the given upgrade completed
     * @param {string} id
     * @param {number} level
     */
    handleUpgradeUnlocked(id, level) {}

    /**
     * Activates a DLC
     * @param {string} dlc
     * @abstract
     */
    activateDlc(dlc) {
        abstract;
        return Promise.resolve();
    }
}
