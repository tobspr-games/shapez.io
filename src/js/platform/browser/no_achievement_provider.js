import { AchievementProviderInterface } from "../achievement_provider";

export class NoAchievementProvider extends AchievementProviderInterface {
    hasAchievements() {
        return false;
    }

    initialize() {
        return Promise.resolve();
    }

    onLoad() {
        return Promise.resolve();
    }

    activate() {
        return Promise.resolve();
    }
}
