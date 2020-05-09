/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { types, BasicSerializableObject } from "../../savegame/serialization";
import { RegularGameSpeed } from "./regular_game_speed";
import { BaseGameSpeed } from "./base_game_speed";
import { PausedGameSpeed } from "./paused_game_speed";
import { performanceNow } from "../../core/builtins";
import { FastForwardGameSpeed } from "./fast_forward_game_speed";
import { gGameSpeedRegistry } from "../../core/global_registries";
import { globalConfig } from "../../core/config";
import { checkTimerExpired, quantizeFloat } from "../../core/utils";
import { createLogger } from "../../core/logging";

const logger = createLogger("game_time");

export class GameTime extends BasicSerializableObject {
    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        super();
        this.root = root;

        // Current ingame time seconds, not incremented while paused
        this.timeSeconds = 0;

        // Current "realtime", a timer which always is incremented no matter whether the game is paused or no
        this.realtimeSeconds = 0;

        // The adjustment, used when loading savegames so we can continue where we were
        this.realtimeAdjust = 0;

        /** @type {BaseGameSpeed} */
        this.speed = new RegularGameSpeed(this.root);

        // Store how much time we have in bucket
        this.logicTimeBudget = 0;

        if (G_IS_DEV) {
            window.addEventListener("keydown", ev => {
                if (ev.key === "p") {
                    this.requestSpeedToggle();
                }
            });
        }
    }

    static getId() {
        return "GameTime";
    }

    static getSchema() {
        return {
            timeSeconds: types.float,
            speed: types.obj(gGameSpeedRegistry),
            realtimeSeconds: types.float,
        };
    }

    /**
     * Fetches the new "real" time, called from the core once per frame, since performance now() is kinda slow
     */
    updateRealtimeNow() {
        this.realtimeSeconds = performanceNow() / 1000.0 + this.realtimeAdjust;
    }

    /**
     * Returns the ingame time in milliseconds
     */
    getTimeMs() {
        return this.timeSeconds * 1000.0;
    }

    /**
     * Safe check to check if a timer is expired. quantizes numbers
     * @param {number} lastTick Last tick of the timer
     * @param {number} tickRateSeconds Interval of the timer in seconds
     */
    isIngameTimerExpired(lastTick, tickRateSeconds) {
        return checkTimerExpired(this.timeSeconds, lastTick, tickRateSeconds);
    }

    /**
     * Returns how many seconds we are in the grace period
     * @returns {number}
     */
    getRemainingGracePeriodSeconds() {
        return 0;
    }

    /**
     * Returns if we are currently in the grace period
     * @returns {boolean}
     */
    getIsWithinGracePeriod() {
        return this.getRemainingGracePeriodSeconds() > 0;
    }

    /**
     * Internal method to generate new logic time budget
     * @param {number} deltaMs
     */
    înternalAddDeltaToBudget(deltaMs) {
        // Only update if game is supposed to update
        if (this.root.hud.shouldPauseGame()) {
            this.logicTimeBudget = 0;
        } else {
            const multiplier = this.getSpeed().getTimeMultiplier();
            this.logicTimeBudget += deltaMs * multiplier;
        }

        // Check for too big pile of updates -> reduce it to 1
        const maxLogicSteps = this.speed.getMaxLogicStepsInQueue();
        if (this.logicTimeBudget > globalConfig.physicsDeltaMs * maxLogicSteps) {
            this.logicTimeBudget = globalConfig.physicsDeltaMs * maxLogicSteps;
        }
    }

    /**
     * Performs update ticks based on the queued logic budget
     * @param {number} deltaMs
     * @param {function():boolean} updateMethod
     */
    performTicks(deltaMs, updateMethod) {
        this.înternalAddDeltaToBudget(deltaMs);

        const speedAtStart = this.root.time.getSpeed();

        // Update physics & logic
        while (this.logicTimeBudget >= globalConfig.physicsDeltaMs) {
            this.logicTimeBudget -= globalConfig.physicsDeltaMs;

            if (!updateMethod()) {
                // Gameover happened or so, do not update anymore
                return;
            }

            // Step game time
            this.timeSeconds = quantizeFloat(this.timeSeconds + globalConfig.physicsDeltaSeconds);

            // Game time speed changed, need to abort since our logic steps are no longer valid
            if (speedAtStart.getId() !== this.speed.getId()) {
                logger.warn(
                    "Skipping update because speed changed from",
                    speedAtStart.getId(),
                    "to",
                    this.speed.getId()
                );
                break;
            }

            // If we queued async tasks, perform them next frame and do not update anymore
            if (this.root.hud.parts.processingOverlay.hasTasks()) {
                break;
            }
        }
    }

    /**
     * Returns ingame time in seconds
     * @returns {number} seconds
     */
    now() {
        return this.timeSeconds;
    }

    /**
     * Returns "real" time in seconds
     * @returns {number} seconds
     */
    realtimeNow() {
        return this.realtimeSeconds;
    }

    /**
     * Returns "real" time in seconds
     * @returns {number} seconds
     */
    systemNow() {
        return (this.realtimeSeconds - this.realtimeAdjust) * 1000.0;
    }

    getIsPaused() {
        return this.speed.getId() === PausedGameSpeed.getId();
    }

    requestSpeedToggle() {
        logger.warn("Request speed toggle");
        switch (this.speed.getId()) {
            case PausedGameSpeed.getId():
                this.setSpeed(new RegularGameSpeed(this.root));
                break;

            case RegularGameSpeed.getId():
                this.setSpeed(new PausedGameSpeed(this.root));
                break;

            case FastForwardGameSpeed.getId():
                this.setSpeed(new RegularGameSpeed(this.root));
                break;
        }
    }

    getSpeed() {
        return this.speed;
    }

    setSpeed(speed) {
        assert(speed instanceof BaseGameSpeed, "Not a valid game speed");
        if (this.speed.getId() === speed.getId()) {
            logger.warn("Same speed set than current one:", speed.constructor.getId());
        }
        this.speed = speed;
    }

    deserialize(data) {
        const errorCode = super.deserialize(data);
        if (errorCode) {
            return errorCode;
        }

        // Adjust realtime now difference so they match
        this.realtimeAdjust = this.realtimeSeconds - performanceNow() / 1000.0;
        this.updateRealtimeNow();

        // Make sure we have a quantizied time
        this.timeSeconds = quantizeFloat(this.timeSeconds);

        this.speed.initializeAfterDeserialize(this.root);
    }
}
