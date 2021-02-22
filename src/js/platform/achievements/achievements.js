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

export class Achievements extends AchievementsInterface {
    initialize() {
        this.map = new Map();
        this.type = "Steam";
        this.count = 0;

        logger.log("Initializing", this.type, "achievements");

        for (let key in ACHIEVEMENTS) {
            this.map[key] = new Map();
            this.map[key].id = IDS[key];
            this.map[key].key = key;
            this.map[key].unlocked = false;
            this.map[key].relevant = true;
            this.count++;
        }

        this.logOnly = globalConfig.debug.testAchievements;

        return Promise.resolve();
    }

    load () {
        // TODO: inspect safe file and update achievements
        // Consider removing load since there's no async behavior anticipated
        return Promise.resolve();
    }

    /**
     * @param {string} key
     */
    unlock (key) {
        let achievement = this.map[key];

        if (!achievement) {
            logger.error("Achievement does not exist:", key);
            return;
        }

        if (!achievement.relevant) {
            logger.debug("Achievement unlocked/irrelevant:", key);
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
