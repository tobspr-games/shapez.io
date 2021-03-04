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
        if (this.provider.hasLoaded()) {
            this.disabled = false;
            return;
        }

        this.provider.onLoad(this.root)
            .then(() => {
                logger.log("Listening for unlocked achievements");
                this.root.signals.achievementUnlocked.dispatch(ACHIEVEMENTS.darkMode);
                this.startSlice();
                this.disabled = false;
            })
            .catch(err => {
                this.disabled = true;
                logger.error("Ignoring achievement signals", err);
            })
    }

    startSlice() {
        this.lastSlice = this.root.time.now();

        this.root.signals.achievementUnlocked.dispatch(ACHIEVEMENTS.play1h, this.lastSlice);
        this.root.signals.achievementUnlocked.dispatch(ACHIEVEMENTS.play10h, this.lastSlice);
        this.root.signals.achievementUnlocked.dispatch(ACHIEVEMENTS.play20h, this.lastSlice);
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
