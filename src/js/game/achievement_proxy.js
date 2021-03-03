/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { createLogger } from "../core/logging";
import { ACHIEVEMENTS } from "../platform/achievement_provider";

const logger = createLogger("achievement_proxy");

export class AchievementProxy {
    /** @param {GameRoot} root */
    constructor(root) {
        this.root = root;
        this.provider = this.root.app.achievementProvider;

        if (!this.provider.hasAchievements()) {
            return;
        }

        this.root.signals.postLoadHook.add(this.onLoad, this);
    }

    onLoad() {
        this.provider.onLoad(this.root)
            .then(() => {
                logger.log("Listening for unlocked achievements");
                this.root.signals.achievementUnlocked.dispatch(ACHIEVEMENTS.darkMode);
            })
            .catch(err => {
                logger.error("Ignoring achievement signals", err);
            })
    }
}
