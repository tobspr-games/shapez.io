/* typehints:start */
import { Application } from "../application";
/* typehints:end */

export const ACHIEVEMENTS = {
    painting: "painting",
    cutting: "cutting",
    rotating: "rotating",
    stacking: "stacking",
    blueprints: "blueprints",
}

export class AchievementsInterface {
    /** @param {Application} app */
    constructor(app) {
        this.app = app;
    }

    /**
     * Load achievements into an initial state, bypassing unlocked and/or
     * irrelevant achievements where possible.
     *
     * @params key
     * @returns {Promise<void>}
     */
    load() {
        abstract;
        return Promise.reject();
    }

    /**
     * Call to unlock an achievement
     * @params {string} [key] - A property within the ACHIEVEMENTS enum or empty if
     * bypassing.
     * @returns {void}
     */
    unlock(key) {
        abstract;
    }

    /**
     * Initializes the list of achievements.
     * @returns {Promise<void>}
     */
    initialize() {
        abstract;
        return Promise.reject();
    }

    /**
     * Checks if achievements are supported in the current build
     * @returns {boolean}
     */
    hasAchievements() {
        abstract;
        return false;
    }
}
