import { globalConfig } from "../../core/config";
import { createLogger } from "../../core/logging";
import { getIPCRenderer } from "../../core/utils";
import { ACHIEVEMENTS, AchievementsInterface } from "../achievements";

const logger = createLogger("achievements/steam");

const IDS = {
    painting: "<id>",
    cutting: "achievement_01", // Test ID
    rotating: "<id>",
    stacking: "<id>",
    blueprints: "<id>",
    wires: "<id>",
}

/** @typedef {object} SteamAchievement
 *  @property {string} id
 *  @property {string} key
 *  @property {boolean} unlocked
 *  @property {boolean} relevant
 *  @property {?Promise} activate
 */

/** @typedef {Map<string, SteamAchievement>} SteamAchievementMap */

export class SteamAchievements extends AchievementsInterface {
    constructor(app) {
        super(app);

        /** @type {SteamAchievementMap} */
        this.map = new Map();
        this.type = "Steam";
        this.count = 0;
        this.steamInitialized = false;

       
        logger.log("Initializing", this.type, "achievements");

        for (let key in ACHIEVEMENTS) {
            this.map.set(key, {
                id: IDS[key],
                key: key,
                unlocked: false,
                relevant: true,
                activate: null
            });

            this.count++;
        }

        this.load()
    }

    load () {
        // TODO: inspect save file and update achievements
    
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

                logger.log("Steam listener is active");

                this.steamInitialized = true;

                return this.ipc.invoke("steam:get-achievement-names")
                    .then(result => {
                        logger.log("steam:get-achievement-names", result);
                    });
            })
            .catch(err => {
                logger.error(err);
            })
    }

    /**
     * @param {string} key
     */
    unlock (key) {
        if (!this.map.has(key)) {
            logger.warn("Achievement does not exist:", key);
            return;
        }

        let achievement = this.map.get(key);

        if (!achievement.relevant) {
            console.log("Achievement unlocked/irrelevant:", key);
            return;
        }

        achievement.activate = achievement.activate || this.activate(achievement)
            .then(() => {
                achievement.unlocked = true;
                achievement.relevant = false;

                logger.log("Achievement unlocked:", key);
            })
            .catch(err => {
                logger.error("Failed to unlock achievement", err);
            })
            .finally(() => {
                achievement.activate = null;
            })

    }

    /**
     * @param {SteamAchievement} achievement
     */
    activate (achievement) {
        if (!this.steamInitialized) {
            return Promise.resolve();
        }

        return this.ipc.invoke("steam:activate-achievement", achievement.id)
    }

    hasAchievements() {
        return true;
    }
}
