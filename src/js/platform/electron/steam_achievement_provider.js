/* typehints:start */
import { Application } from "../../application";
import { Achievement } from "../achievement_provider";
/* typehints:end */

import { createLogger } from "../../core/logging";
import { getIPCRenderer } from "../../core/utils";
import {
    ACHIEVEMENTS,
    AchievementCollection,
    AchievementProviderInterface
} from "../achievement_provider";

const logger = createLogger("achievements/steam");

const ACHIEVEMENT_IDS = {
    [ACHIEVEMENTS.painting]: "<id>",
    [ACHIEVEMENTS.cutting]: "achievement_01", // Test ID
    [ACHIEVEMENTS.rotating]: "<id>",
    [ACHIEVEMENTS.stacking]: "<id>",
    [ACHIEVEMENTS.blueprints]: "<id>",
    [ACHIEVEMENTS.wires]: "<id>",
    [ACHIEVEMENTS.storage]: "<id>",
    [ACHIEVEMENTS.freedom]: "<id>",
    [ACHIEVEMENTS.networked]: "<id>",
    [ACHIEVEMENTS.theLogo]: "<id>"
};

export class SteamAchievementProvider extends AchievementProviderInterface {
    /** @param {Application} app */
    constructor(app) {
        super(app);

        this.initialized = false;
        this.collection = new AchievementCollection(
            Object.keys(ACHIEVEMENT_IDS),
            this.activate.bind(this)
        );

        logger.log("Steam achievement collection created");
    }

    initialize () {
        if (!G_IS_STANDALONE) {
            logger.warn("Steam listener isn't active. Achievements won't sync.");
            return Promise.resolve();
        }

        this.ipc = getIPCRenderer();

        return this.ipc.invoke("steam:is-initialized")
            .then(initialized => {
                if (!initialized) {
                    logger.warn("Steam failed to intialize. Achievements won't sync.");
                    return;
                }

                this.initialized = true;

                logger.log("Steam achievement provider initialized");
            })
            .catch(err => {
                logger.error("Steam achievement provider error", err);
                throw err;
            })
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @param {*} [details] - Additional information as needed to validate
     */
    unlock (key, details) {
        if (!this.collection.has(key)) {
            console.log("Achievement already unlocked", key);
            return;
        }

        if (!this.collection.isValid(key, details)) {
            console.log("Achievement is invalid", key);
            return;
        }

        this.collection.unlock(key)
            .then(() => {
                logger.log("Achievement unlocked:", key);
            })
            .catch(err => {
                logger.error("Failed to unlock achievement", err);
            })
    }

    /**
     * @param {string} key - Maps to an API ID for the achievement
     * @returns {string}
     */
    getApiId (key) {
        return ACHIEVEMENT_IDS[key];
    }

    /**
     * @param {Achievement} achievement
     * @returns {Promise<void>}
     */
    activate (achievement) {
        if (!this.initialized) {
            return Promise.resolve();
        }

        return this.ipc.invoke("steam:activate-achievement", this.getApiId(achievement.key))
    }

    /**
     * @returns {boolean}
     */
    hasAchievements() {
        return true;
    }
}
