/* typehints:start */
import type { Entity } from "./entity";
import type { GameRoot } from "./root";
/* typehints:end */
import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { ACHIEVEMENTS } from "../platform/achievement_provider";
import { getBuildingDataFromCode } from "./building_codes";
const logger: any = createLogger("achievement_proxy");
const ROTATER: any = "rotater";
const DEFAULT: any = "default";
export class AchievementProxy {
    public root = root;
    public provider = this.root.app.achievementProvider;
    public disabled = true;
    public sliceTime = 0;

        constructor(root) {
        if (G_IS_DEV && globalConfig.debug.testAchievements) {
            // still enable the proxy
        }
        else if (!this.provider.hasAchievements()) {
            return;
        }
        this.root.signals.postLoadHook.add(this.onLoad, this);
    }
    onLoad(): any {
        if (!this.root.gameMode.hasAchievements()) {
            logger.log("Disabling achievements because game mode does not have achievements");
            this.disabled = true;
            return;
        }
        this.provider
            .onLoad(this.root)
            .then((): any => {
            this.disabled = false;
            logger.log("Recieving achievement signals");
            this.initialize();
        })
            .catch((err: any): any => {
            this.disabled = true;
            logger.error("Ignoring achievement signals", err);
        });
    }
    initialize(): any {
        this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.darkMode, null);
        if (this.has(ACHIEVEMENTS.mam)) {
            this.root.signals.entityAdded.add(this.onMamFailure, this);
            this.root.signals.entityDestroyed.add(this.onMamFailure, this);
            this.root.signals.storyGoalCompleted.add(this.onStoryGoalCompleted, this);
        }
        if (this.has(ACHIEVEMENTS.noInverseRotater)) {
            this.root.signals.entityAdded.add(this.onEntityAdded, this);
        }
        this.startSlice();
    }
    startSlice(): any {
        this.sliceTime = this.root.time.now();
        this.root.signals.bulkAchievementCheck.dispatch(ACHIEVEMENTS.storeShape, this.sliceTime, ACHIEVEMENTS.throughputBp25, this.sliceTime, ACHIEVEMENTS.throughputBp50, this.sliceTime, ACHIEVEMENTS.throughputLogo25, this.sliceTime, ACHIEVEMENTS.throughputLogo50, this.sliceTime, ACHIEVEMENTS.throughputRocket10, this.sliceTime, ACHIEVEMENTS.throughputRocket20, this.sliceTime, ACHIEVEMENTS.play1h, this.sliceTime, ACHIEVEMENTS.play10h, this.sliceTime, ACHIEVEMENTS.play20h, this.sliceTime);
    }
    update(): any {
        if (this.disabled) {
            return;
        }
        if (this.root.time.now() - this.sliceTime > globalConfig.achievementSliceDuration) {
            this.startSlice();
        }
    }
    /**
     * {}
     */
    has(key: string): boolean {
        if (!this.provider.collection) {
            return false;
        }
        return this.provider.collection.map.has(key);
    }
        onEntityAdded(entity: Entity): any {
        if (!entity.components.StaticMapEntity) {
            return;
        }
        const building: any = getBuildingDataFromCode(entity.components.StaticMapEntity.code);
        if (building.metaInstance.id !== ROTATER) {
            return;
        }
        if (building.variant === DEFAULT) {
            return;
        }
        this.root.savegame.currentData.stats.usedInverseRotater = true;
        this.root.signals.entityAdded.remove(this.onEntityAdded);
    }
        onStoryGoalCompleted(level: number): any {
        if (level > 26) {
            this.root.signals.entityAdded.add(this.onMamFailure, this);
            this.root.signals.entityDestroyed.add(this.onMamFailure, this);
        }
        this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.mam, null);
        // reset on every level
        this.root.savegame.currentData.stats.failedMam = false;
    }
    onMamFailure(): any {
        this.root.savegame.currentData.stats.failedMam = true;
    }
}
