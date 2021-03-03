/* typehints:start */
import { Application } from "../../application";
import { GameRoot } from "../../game/root";
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
    [ACHIEVEMENTS.blueprints]: "<id>",
    [ACHIEVEMENTS.cutting]: "achievement_01", // Test ID
    [ACHIEVEMENTS.darkMode]: "<id>",
    [ACHIEVEMENTS.fourLayers]: "<id>",
    [ACHIEVEMENTS.freedom]: "<id>",
    [ACHIEVEMENTS.hundredShapes]: "<id>",
    [ACHIEVEMENTS.longBelt]: "<id>",
    [ACHIEVEMENTS.millionBlueprintShapes]: "<id>",
    [ACHIEVEMENTS.networked]: "<id>",
    [ACHIEVEMENTS.painting]: "<id>",
    [ACHIEVEMENTS.rotating]: "<id>",
    [ACHIEVEMENTS.stacking]: "<id>",
    [ACHIEVEMENTS.storage]: "<id>",
    [ACHIEVEMENTS.theLogo]: "<id>",
    [ACHIEVEMENTS.toTheMoon]: "<id>",
    [ACHIEVEMENTS.wires]: "<id>",
};

export class SteamAchievementProvider extends AchievementProviderInterface {
    /** @param {Application} app */
    constructor(app) {
        super(app);

        this.initialized = false;
        this.collection = new AchievementCollection(this.activate.bind(this));

        logger.log("Collection created with", this.collection.map.size, "achievements");
    }

    /**
     * @returns {boolean}
     */
    hasAchievements() {
        return true;
    }

    /** @param {GameRoot} root */
    onLoad(root) {
        if (this.collection.initialized) {
            return Promise.resolve();
        }

        try {
            this.collection.initialize(root);
            logger.log(this.collection.map.size, "achievements are relevant and initialized");
            return Promise.resolve();
        } catch (err) {
            logger.error("Failed to initialize the achievement collection");
            return Promise.reject(err);
        }
    }

    initialize() {
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
            });
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
                logger.log("Achievement activated:", key);
            })
            .catch(err => {
                logger.error("Failed to activate achievement:", key, err);
            })
    }
}
