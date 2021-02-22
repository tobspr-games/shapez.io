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
    constructor(app) {
        /** @type {Application} */
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
     * @params [key] - A property within the ACHIEVEMENTS enum or empty if
     * bypassing.
     * @returns {(undefined|Promise)}
     */
    unlock(key) {
        abstract;
        return Promise.reject();
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
