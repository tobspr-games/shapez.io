import { AchievementsInterface } from "../achievements";

export class NoAchievements extends AchievementsInterface {
    initialize() {
        return Promise.resolve();
    }

    load() {
        return Promise.resolve();
    }

    hasAchievements() {
        return false;
    }

    unlock() {
    }
}
