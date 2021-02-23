import { AchievementsInterface } from "../achievements";

export class NoAchievements extends AchievementsInterface {
    load() {
        return Promise.resolve();
    }

    hasAchievements() {
        return false;
    }

    unlock() {
    }
}
