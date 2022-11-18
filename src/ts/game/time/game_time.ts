/* typehints:start */
import type { GameRoot } from "../root";
/* typehints:end */
import { types, BasicSerializableObject } from "../../savegame/serialization";
import { RegularGameSpeed } from "./regular_game_speed";
import { BaseGameSpeed } from "./base_game_speed";
import { PausedGameSpeed } from "./paused_game_speed";
import { gGameSpeedRegistry } from "../../core/global_registries";
import { globalConfig } from "../../core/config";
import { createLogger } from "../../core/logging";
const logger: any = createLogger("game_time");
export class GameTime extends BasicSerializableObject {
    public root = root;
    public timeSeconds = 0;
    public realtimeSeconds = 0;
    public realtimeAdjust = 0;
    public speed: BaseGameSpeed = new RegularGameSpeed(this.root);
    public logicTimeBudget = 0;

        constructor(root) {
        super();
    }
    static getId(): any {
        return "GameTime";
    }
    static getSchema(): any {
        return {
            timeSeconds: types.float,
            speed: types.obj(gGameSpeedRegistry),
            realtimeSeconds: types.float,
        };
    }
    /**
     * Fetches the new "real" time, called from the core once per frame, since performance now() is kinda slow
     */
    updateRealtimeNow(): any {
        this.realtimeSeconds = performance.now() / 1000.0 + this.realtimeAdjust;
    }
    /**
     * Returns the ingame time in milliseconds
     */
    getTimeMs(): any {
        return this.timeSeconds * 1000.0;
    }
    /**
     * Returns how many seconds we are in the grace period
     * {}
     */
    getRemainingGracePeriodSeconds(): number {
        return 0;
    }
    /**
     * Returns if we are currently in the grace period
     * {}
     */
    getIsWithinGracePeriod(): boolean {
        return this.getRemainingGracePeriodSeconds() > 0;
    }
    /**
     * Internal method to generate new logic time budget
     */
    internalAddDeltaToBudget(deltaMs: number): any {
        // Only update if game is supposed to update
        if (this.root.hud.shouldPauseGame()) {
            this.logicTimeBudget = 0;
        }
        else {
            const multiplier: any = this.getSpeed().getTimeMultiplier();
            this.logicTimeBudget += deltaMs * multiplier;
        }
        // Check for too big pile of updates -> reduce it to 1
        let maxLogicSteps: any = Math.max(3, (this.speed.getMaxLogicStepsInQueue() * this.root.dynamicTickrate.currentTickRate) / 60);
        if (G_IS_DEV && globalConfig.debug.framePausesBetweenTicks) {
            maxLogicSteps *= 1 + globalConfig.debug.framePausesBetweenTicks;
        }
        if (this.logicTimeBudget > this.root.dynamicTickrate.deltaMs * maxLogicSteps) {
            this.logicTimeBudget = this.root.dynamicTickrate.deltaMs * maxLogicSteps;
        }
    }
    /**
     * Performs update ticks based on the queued logic budget
     */
    performTicks(deltaMs: number, updateMethod: function():boolean): any {
        this.internalAddDeltaToBudget(deltaMs);
        const speedAtStart: any = this.root.time.getSpeed();
        let effectiveDelta: any = this.root.dynamicTickrate.deltaMs;
        if (G_IS_DEV && globalConfig.debug.framePausesBetweenTicks) {
            effectiveDelta += globalConfig.debug.framePausesBetweenTicks * this.root.dynamicTickrate.deltaMs;
        }
        // Update physics & logic
        while (this.logicTimeBudget >= effectiveDelta) {
            this.logicTimeBudget -= effectiveDelta;
            if (!updateMethod()) {
                // Gameover happened or so, do not update anymore
                return;
            }
            // Step game time
            this.timeSeconds += this.root.dynamicTickrate.deltaSeconds;
            // Game time speed changed, need to abort since our logic steps are no longer valid
            if (speedAtStart.getId() !== this.speed.getId()) {
                logger.warn("Skipping update because speed changed from", speedAtStart.getId(), "to", this.speed.getId());
                break;
            }
        }
    }
    /**
     * Returns ingame time in seconds
     * {} seconds
     */
    now(): number {
        return this.timeSeconds;
    }
    /**
     * Returns "real" time in seconds
     * {} seconds
     */
    realtimeNow(): number {
        return this.realtimeSeconds;
    }
    /**
     * Returns "real" time in seconds
     * {} seconds
     */
    systemNow(): number {
        return (this.realtimeSeconds - this.realtimeAdjust) * 1000.0;
    }
    getIsPaused(): any {
        return this.speed.getId() === PausedGameSpeed.getId();
    }
    getSpeed(): any {
        return this.speed;
    }
    setSpeed(speed: any): any {
        assert(speed instanceof BaseGameSpeed, "Not a valid game speed");
        if (this.speed.getId() === speed.getId()) {

            logger.warn("Same speed set than current one:", speed.constructor.getId());
        }
        this.speed = speed;
    }
    deserialize(data: any): any {
        const errorCode: any = super.deserialize(data);
        if (errorCode) {
            return errorCode;
        }
        // Adjust realtime now difference so they match
        this.realtimeAdjust = this.realtimeSeconds - performance.now() / 1000.0;
        this.updateRealtimeNow();
        this.speed.initializeAfterDeserialize(this.root);
    }
}
