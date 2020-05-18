import { GameRoot } from "./root";
import { createLogger } from "../core/logging";
import { globalConfig } from "../core/config";
import { performanceNow, Math_min, Math_round, Math_max } from "../core/builtins";
import { round3Digits } from "../core/utils";

const logger = createLogger("dynamic_tickrate");

export class DynamicTickrate {
    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;

        this.setTickRate(120);

        this.currentTickStart = null;
        this.capturedTicks = [];
        this.averageTickDuration = 0;

        // Exposed
        this.deltaSeconds = 0;
        this.deltaMs = 0;
    }

    /**
     * Sets the tick rate to N updates per second
     * @param {number} rate
     */
    setTickRate(rate) {
        logger.log("Applying tick-rate of", rate);
        this.currentTickRate = rate;
        this.deltaMs = 1000.0 / this.currentTickRate;
        this.deltaSeconds = 1.0 / this.currentTickRate;
    }

    /**
     * Increases the tick rate marginally
     */
    increaseTickRate() {
        this.setTickRate(Math_round(Math_min(globalConfig.maximumTickRate, this.currentTickRate * 1.1)));
    }

    /**
     * Decreases the tick rate marginally
     */
    decreaseTickRate() {
        this.setTickRate(Math_round(Math_min(globalConfig.maximumTickRate, this.currentTickRate * 0.9)));
    }

    /**
     * Call whenever a tick began
     */
    beginTick() {
        assert(this.currentTickStart === null, "BeginTick called twice");
        this.currentTickStart = performanceNow();

        if (this.capturedTicks.length > this.currentTickRate * 4) {
            // Take only a portion of the ticks
            this.capturedTicks.sort();
            this.capturedTicks.splice(0, 10);
            this.capturedTicks.splice(this.capturedTicks.length - 11, 10);

            let average = 0;
            for (let i = 0; i < this.capturedTicks.length; ++i) {
                average += this.capturedTicks[i];
            }
            average /= this.capturedTicks.length;

            // Calculate tick duration to cover X% of the frame
            const ticksPerFrame = this.currentTickRate / 60;
            const maxFrameDurationMs = 8;
            const maxTickDuration = maxFrameDurationMs / ticksPerFrame;
            // const maxTickDuration = (1000 / this.currentTickRate) * 0.75;
            logger.log(
                "Average time per tick:",
                round3Digits(average) + "ms",
                "allowed are",
                maxTickDuration
            );
            this.averageTickDuration = average;

            if (average < maxTickDuration) {
                this.increaseTickRate();
            } else {
                this.decreaseTickRate();
            }

            this.capturedTicks = [];
        }
    }

    /**
     * Call whenever a tick ended
     */
    endTick() {
        assert(this.currentTickStart !== null, "EndTick called without BeginTick");
        const duration = performanceNow() - this.currentTickStart;
        this.capturedTicks.push(duration);
        this.currentTickStart = null;
    }
}
