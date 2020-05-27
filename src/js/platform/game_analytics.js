/* typehints:start */
import { Application } from "../application";
import { ShapeDefinition } from "../game/shape_definition";
import { Savegame } from "../savegame/savegame";
/* typehints:end */

export class GameAnalyticsInterface {
    constructor(app) {
        /** @type {Application} */
        this.app = app;
    }

    /**
     * Initializes the analytics
     * @returns {Promise<void>}
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
     * @param {ShapeDefinition} definition
     */
    handleShapeDelivered(definition) {}

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
}
