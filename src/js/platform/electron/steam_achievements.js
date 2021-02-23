import { ACHIEVEMENTS, AchievementsInterface } from "../achievements";
import { globalConfig } from "../../core/config";
import { createLogger } from "../../core/logging";

const logger = createLogger("achievements/steam");

const IDS = {
    painting: "<id>",
    cutting: "<id>",
    rotating: "<id>",
    stacking: "<id>",
    blueprints: "<id>"
}

/** @typedef {object} SteamAchievementMap
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

        /** @type {AchievementMap} */
        this.map = new Map();
        this.type = "Steam";
        this.count = 0;

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

        this.logOnly = globalConfig.debug.testAchievements;
    }

    load () {
        // TODO: inspect save file and update achievements
        // Consider removing load since there's no async behavior anticipated
        return Promise.resolve();
    }

    /**
     * @param {string} key
     */
    unlock (key) {
        if (!this.map.has(key)) {
            logger.error("Achievement does not exist:", key);
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

    activate (achievement) {
        if (this.logOnly) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            //TODO: Implement greenworks activate

            return resolve();
        });
    }

    hasAchievements() {
        return true;
    }
}
