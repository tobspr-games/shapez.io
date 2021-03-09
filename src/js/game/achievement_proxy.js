/* typehints:start */
import { Entity } from "./entity";
import { GameRoot } from "./root";
/* typehints:end */

import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { ACHIEVEMENTS } from "../platform/achievement_provider";
import { getBuildingDataFromCode } from "./building_codes";

const logger = createLogger("achievement_proxy");

const ROTATER = "rotater";
const DEFAULT = "default";
const BELT = "belt";
const LEVEL_26 = 26;

export class AchievementProxy {
    /** @param {GameRoot} root */
    constructor(root) {
        this.root = root;
        this.provider = this.root.app.achievementProvider;
        this.disabled = true;

        if (!this.provider.hasAchievements()) {
            return;
        }

        this.sliceTime = 0;
        this.sliceIteration = 1;
        this.sliceIterationLimit = 10;

        this.root.signals.postLoadHook.add(this.onLoad, this);
    }

    onLoad() {
        this.provider.onLoad(this.root)
            .then(() => {
                this.disabled = false;
                logger.log("Recieving achievement signals");
                this.initialize();
            })
            .catch(err => {
                this.disabled = true;
                logger.error("Ignoring achievement signals", err);
            });
    }

    initialize() {
        this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.darkMode);

        if (this.has(ACHIEVEMENTS.mam)) {
            this.root.signals.storyGoalCompleted.add(this.onStoryGoalCompleted, this);
        }

        if (this.has(ACHIEVEMENTS.noInverseRotater)) {
            this.root.signals.entityAdded.add(this.onEntityAdded, this);
        }

        if (this.has(ACHIEVEMENTS.noBeltUpgradesUntilBp)) {
            this.root.signals.upgradePurchased.add(this.onUpgradePurchased, this);
        }

        this.startSlice();
    }

    startSlice() {
        this.sliceTime = this.root.time.now();

        // Every slice
        this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.storeShape);

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

        // Every 10th slice
        if (this.sliceIteration % 10 === 0) {
            this.provider.collection.clean();
        }

        if (this.sliceIteration === this.sliceIterationLimit) {
            this.sliceIteration = 1;
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

    /**
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return this.provider.collection.map.has(key);
    }

    /** @param {Entity} entity */
    onEntityAdded(entity) {
        if (!entity.components.StaticMapEntity) {
            return;
        }

        const building = getBuildingDataFromCode(entity.components.StaticMapEntity.code)

        if (building.metaInstance.id !== ROTATER) {
            return;
        }

        if (building.variant === DEFAULT) {
            return;
        }

        this.root.savegame.currentData.stats.usedInverseRotater = true;
        this.root.signals.entityAdded.remove(this.onEntityAdded);
    }

    /** @param {number} level */
    onStoryGoalCompleted(level) {
        if (level === LEVEL_26) {
            this.root.signals.entityAdded.add(this.onMamFailure, this);
            this.root.signals.entityDestroyed.add(this.onMamFailure, this);
        } else if (level === LEVEL_26 + 1) {
            this.root.signals.storyGoalCompleted.remove(this.onStoryGoalCompleted, this);
        }
    }

    onMamFailure() {
        this.root.savegame.currentData.stats.failedMam = true;
        this.root.signals.entityAdded.remove(this.onMamFailure);
        this.root.signals.entityDestroyed.remove(this.onMamFailure);
        this.root.signals.storyGoalCompleted.remove(this.onStoryGoalCompleted);
    }

    /** @param {string} upgrade */
    onUpgradePurchased(upgrade) {
        if (upgrade !== BELT) {
            return;
        }

        this.root.savegame.currentData.stats.upgradedBelt = true;
        this.root.signals.upgradePurchased.remove(this.onUpgradePurchased);
    }
}
