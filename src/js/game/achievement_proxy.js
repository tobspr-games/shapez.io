/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { ACHIEVEMENTS } from "../platform/achievement_provider";
import { BasicSerializableObject } from "../savegame/serialization";
//import { typeAchievementCollection } from "./achievement_resolver";

const logger = createLogger("achievement_proxy");

export class AchievementProxy extends BasicSerializableObject {
    static getId() {
        return "AchievementProxy";
    }

    static getSchema() {
        return {
//            collection: typeAchievementCollection
        };
    }

    deserialize(data, root) {

    }

    /** @param {GameRoot} root */
    constructor(root) {
        super();

        this.root = root;
        this.provider = this.root.app.achievementProvider;
        this.disabled = true;

        if (!this.provider.hasAchievements()) {
            return;
        }

        this.sliceTime = 0;
        this.sliceIteration = 0;
        this.sliceIterationLimit = 2;

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

    // Have certain checks every 30 seconds, 10 seconds, etc.
    // Re-check relevance every so often
    // Consider disabling checks if no longer relevant
    startSlice() {
        this.sliceTime = this.root.time.now();

        // Every slice
        this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.storeShape, this.sliceTime);

        // Every other slice
        if (this.sliceIteration % 2 === 0) {
            this.root.signals.bulkAchievementCheck.dispatch(
                ACHIEVEMENTS.throughputBp25, this.sliceTime,
                ACHIEVEMENTS.throughputBp50, this.sliceTime,
                ACHIEVEMENTS.throughputLogo25, this.sliceTime,
                ACHIEVEMENTS.throughputLogo50, this.sliceTime,
                ACHIEVEMENTS.throughputRocket10, this.sliceTime,
                ACHIEVEMENTS.throughputRocket20, this.sliceTime
            );
        }

        // Every 3rd slice
        if (this.sliceIteration % 3 === 0) {
            this.root.signals.bulkAchievementCheck.dispatch(
                ACHIEVEMENTS.play1h, this.sliceTime,
                ACHIEVEMENTS.play10h, this.sliceTime,
                ACHIEVEMENTS.play20h, this.sliceTime
            );
        }

        if (this.sliceIteration === this.sliceIterationLimit) {
            this.sliceIteration = 0;
        } else {
            this.sliceIteration++;
        }
    }

    update() {
        if (this.disabled) {
            return;
        }

        if (this.root.time.now() - this.sliceTime > globalConfig.achievementSliceDuration) {
            this.startSlice();
        }
    }
}
