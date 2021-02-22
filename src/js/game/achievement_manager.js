/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";

const logger = createLogger("achievement_manager");

export class AchievementManager {
    constructor(root) {
        this.root = root;
        this.achievements = this.root.app.achievements;

        this.load()
    }

    load () {
        return this.achievements.load()
            .then(() => {
                if (!this.achievements.hasAchievements()) {
                    logger.log("Achievements disabled");
                    return;
                }

                logger.log("There are", this.achievements.count, "achievements");
            })
            .catch(err => {
                logger.error("Achievements failed to load", err);
            })
    }

    unlock (key) {
        this.achievements.unlock(key);
    }
}
