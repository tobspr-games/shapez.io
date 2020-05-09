/* typehints:start */
import { Application } from "../application";
import { ShapeDefinition } from "../game/shape_definition";
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
