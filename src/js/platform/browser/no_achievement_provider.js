import { AchievementProviderInterface } from "../achievement_provider";

export class NoAchievementProvider extends AchievementProviderInterface {
    hasAchievements() {
        return false;
    }

    initialize() {
        return Promise.resolve();
    }

    unlock() {
    }
}
