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
    [ACHIEVEMENTS.theLogo]: "<id>",
    [ACHIEVEMENTS.toTheMoon]: "<id>",
    [ACHIEVEMENTS.millionBlueprintShapes]: "<id>",

    [ACHIEVEMENTS.hundredShapes]: "<id>",
};

export class SteamAchievementProvider extends AchievementProviderInterface {
    /** @param {Application} app */
    constructor(app) {
        super(app);

        this.initialized = false;
        this.keys = Object.keys(ACHIEVEMENT_IDS);
        this.collection = new AchievementCollection(this.keys, this.activate.bind(this));

        logger.log("Steam achievement collection created");
    }

    /**
     * @returns {boolean}
     */
    hasAchievements() {
        return true;
    }

    initialize (root) {
        this.collection.initialize(root);

        if (!G_IS_STANDALONE) {
            logger.warn("Steam unavailable. Achievements won't sync.");
            return Promise.resolve();
        }

        this.ipc = getIPCRenderer();

        return this.ipc.invoke("steam:is-initialized")
            .then(initialized => {
                this.initialized = initialized;

                if (!this.initialized) {
                    logger.warn("Steam failed to intialize. Achievements won't sync.");
                } else {
                    logger.log("Steam achievement provider initialized");
                }
            })
            .catch(err => {
                logger.error("Steam achievement provider error", err);
                throw err;
            })
    }

    /**
     * @param {string} key - An ACHIEVEMENTS key
     * @returns {Promise<void>}
     */
    activate (key) {
        let promise;

        if (!this.initialized) {
            promise = Promise.resolve();
        } else {
            promise = this.ipc.invoke("steam:activate-achievement", ACHIEVEMENT_IDS[key]);
        }

        return promise 
            .then(() => {
                logger.log("Achievement unlocked:", key);
            })
            .catch(err => {
                logger.error("Failed to unlock achievement:", key, err);
            })
    }
}
