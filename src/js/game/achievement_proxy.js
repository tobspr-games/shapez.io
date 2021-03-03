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

        this.root.signals.postLoadHook.add(this.onLoad, this);
    }

    onLoad() {
        this.provider.initialize(this.root)
            .then(() => {
                logger.log("Listening for unlocked achievements");
            })
            .catch(err => {
                logger.error("Ignoring achievement signals", err);
            })
    }
}
