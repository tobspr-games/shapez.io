import { AchievementsInterface } from "../achievements";
import { globalConfig } from "../../core/config";
import { createLogger } from "../../core/logging";
import { newEmptyMap } from "../../core/utils";
//import { T } from "../../translations";

const logger = createLogger("achievements/default");

// Include API id per key
export const ACHIEVEMENTS = {
    painting: "painting"
}

export class Achievements extends AchievementsInterface {
    initialize() {
        this.authTicket = null;
        this.achievementNames = null;
        this.achievements = null;
        this.connected = false;
        this.connectPromise = Promise.resolve();

        if (globalConfig.debug.testAchievements) {
            return Promise.resolve();
        }

        // Check for resolve in AchievementManager via load() to not block game state
        // transition
        this.connectPromise = this.fetchAuthTicket()
            .then(() => this.fetchAchievementNames());

        return Promise.resolve();
    }

    fetchAuthTicket () {
        return Promise.resolve();
    }

    fetchAchievementNames () {
        return Promise.resolve();
    }

    load () {
        this.achievements = newEmptyMap();

        for (let key in ACHIEVEMENTS) {
            this.achievements[key] = newEmptyMap();
            this.achievements[key].unlocked = false;
            this.achievements[key].invalid = false;
        }

        return this.connectPromise
            .then(() => {
                // factor in game state, save data, then Steam data (if accessible) as
                // source of truth.
            })
    }

    /**
     * @param {string} key
     */
    fetchAchievement (key) {
        return Promise.resolve();
    }

    /**
     * @param {string} key
     */
    unlockAchievement (key) {
        return Promise.resolve();
    }

    getAchievements() {
        return this.achievements;
    }

    hasAchievements() {
        return true;
    }
}
