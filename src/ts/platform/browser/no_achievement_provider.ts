import { AchievementProviderInterface } from "../achievement_provider";
export class NoAchievementProvider extends AchievementProviderInterface {
    hasAchievements(): any {
        return false;
    }
    hasLoaded(): any {
        return false;
    }
    initialize(): any {
        return Promise.resolve();
    }
    onLoad(): any {
        return Promise.reject(new Error("No achievements to load"));
    }
    activate(): any {
        return Promise.resolve();
    }
}
