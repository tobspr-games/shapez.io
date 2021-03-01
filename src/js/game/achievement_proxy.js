/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { createLogger } from "../core/logging";

const logger = createLogger("achievement_proxy");

export class AchievementProxy {
    /** @param {GameRoot} root */
    constructor(root) {
        this.root = root;
        this.provider = this.root.app.achievementProvider;

        if (!this.provider.hasAchievements()) {
            return;
        }

        this.provider.initialize()
            .then(() => {
                this.root.signals.achievementUnlocked.add(this.provider.unlock, this.provider);

                logger.log("Listening for unlocked achievements");
            })
            .catch(err => {
                logger.error("Ignoring achievement signals", err);
            })
    }
}
