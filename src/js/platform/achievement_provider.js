/* typehints:start */
import { Application } from "../application";
/* typehints:end */

export const ACHIEVEMENTS = {
    painting: "painting",
    cutting: "cutting",
    rotating: "rotating",
    stacking: "stacking",
    blueprints: "blueprints",
    wires: "wires",
    storage: "storage",
    freedom: "freedom",
    networked: "networked",
    theLogo: "theLogo",
};

export class AchievementProviderInterface {
    /** @param {Application} app */
    constructor(app) {
        this.app = app;
    }

    /**
     * Initializes the achievement provider.
     * @returns {Promise<void>}
     */
    initialize() {
        abstract;
        return Promise.reject();
    }

    /**
     * Call to unlock an achievement
     * @param {string} [key] - A property within the ACHIEVEMENTS enum or empty if
     * bypassing.
     * @returns {void}
     */
    unlock(key) {
        abstract;
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

export class Achievement {
    /**
     * @param {string} key - An ACHIEVEMENTS key
     */
    constructor (key) {
        this.key = key;
        this.unlock = null;
        this.isValid = null;
    }
}

export class AchievementCollection {
    /**
     * @param {string[]} keys - An array of ACHIEVEMENTS keys
     * @param {function} [activate] - Resolves when provider activation is complete
     */
    constructor (keys, activate) {
        this.map = new Map();
        this.activate = activate ? activate : () => Promise.resolve();

        for (var i = 0; i < keys.length; i++) {
            assert(ACHIEVEMENTS[keys[i]], "Achievement does not exist: " + keys[i]);

            const achievement = new Achievement(keys[i]);
            this.setValidation(achievement);
            this.map.set(keys[i], achievement);
        }
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @returns {boolean}
     */
    has(key) {
        return this.map.has(key);
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @param {*} [details] - Additional information as needed to validate
     * @returns {boolean}
     */
    isValid(key, details) {
        return this.map.get(key).isValid(details);
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @returns {Promise<void>}
     */
   unlock(key) {
        const achievement = this.map.get(key);

        return achievement.unlock = achievement.unlock || this.activate(achievement)
            .then(() => {
                this.map.delete(key);
            })
            .catch(err => {
                achievement.unlock = null;

                throw err;
            })
    }

    /**
     * @param {Achievement} achievement - Achievement receiving a validation function
     */
    setValidation(achievement) {
        switch (achievement.key) {
            case ACHIEVEMENTS.theLogo:
                achievement.isValid = this.isTheLogoValid;
                break;
            default:
                achievement.isValid = () => true;
                break;
        }
    }

    /**
     * @param {string} shortKey - The shape's shortKey to check
     * @returns {boolean}
     */
    isTheLogoValid(shortKey) {
        return shortKey === "RuCw--Cw:----Ru--";
    }
}
