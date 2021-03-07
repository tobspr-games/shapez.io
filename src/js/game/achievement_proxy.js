/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { ACHIEVEMENTS } from "../platform/achievement_provider";

const logger = createLogger("achievement_proxy");

export class AchievementProxy {
    /** @param {GameRoot} root */
    constructor(root) {
        this.root = root;
        this.provider = this.root.app.achievementProvider;
        this.lastSlice = 0;
        this.disabled = true;

        if (!this.provider.hasAchievements()) {
            return;
        }

        this.root.signals.postLoadHook.add(this.onLoad, this);
    }

    onLoad() {
        this.provider.onLoad(this.root)
            .then(() => {
                logger.log("Recieving achievement signals");
                this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.darkMode);
                this.startSlice();
                this.disabled = false;
            })
            .catch(err => {
                this.disabled = true;
                logger.error("Ignoring achievement signals", err);
            });
    }

    startSlice() {
        this.lastSlice = this.root.time.now();

        this.root.signals.bulkAchievementCheck.dispatch(
            ACHIEVEMENTS.play1h, this.lastSlice,
            ACHIEVEMENTS.play10h, this.lastSlice,
            ACHIEVEMENTS.play20h, this.lastSlice
        );
    }

    update() {
        if (this.disabled) {
            return;
        }

        if (this.root.time.now() - this.lastSlice > globalConfig.achievementSliceDuration) {
            this.startSlice();
        }
    }
}
