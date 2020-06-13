import { GameRoot } from "./root";
import { createLogger } from "../core/logging";
import { globalConfig } from "../core/config";
import { performanceNow, Math_min, Math_round, Math_max } from "../core/builtins";
import { round3Digits } from "../core/utils";

const logger = createLogger("dynamic_tickrate");

const fpsAccumulationTime = 1000;

export class DynamicTickrate {
    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;

        this.currentTickStart = null;
        this.capturedTicks = [];
        this.averageTickDuration = 0;

        this.accumulatedFps = 0;
        this.accumulatedFpsLastUpdate = 0;

        this.averageFps = 60;

        this.setTickRate(60);

        if (G_IS_DEV && globalConfig.debug.renderForTrailer) {
            this.setTickRate(300);
        }
    }

    onFrameRendered() {
        ++this.accumulatedFps;

        const now = performanceNow();
        const timeDuration = now - this.accumulatedFpsLastUpdate;
        if (timeDuration > fpsAccumulationTime) {
            const avgFps = (this.accumulatedFps / fpsAccumulationTime) * 1000;
            this.averageFps = avgFps;
            this.accumulatedFps = 0;
            this.accumulatedFpsLastUpdate = now;
        }
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
        const desiredFps = this.root.app.settings.getDesiredFps();
        if ((G_IS_DEV && globalConfig.debug.renderForTrailer) || globalConfig.debug.disableDynamicTickrate) {
            this.setTickRate(Math_round(Math_min(desiredFps, this.currentTickRate * 1.2)));
            return;
        }

        this.setTickRate(Math_round(Math_min(desiredFps, this.currentTickRate * 1.2)));
    }

    /**
     * Decreases the tick rate marginally
     */
    decreaseTickRate() {
        const desiredFps = this.root.app.settings.getDesiredFps();
        if ((G_IS_DEV && globalConfig.debug.renderForTrailer) || globalConfig.debug.disableDynamicTickrate) {
            this.setTickRate(Math_round(Math_max(desiredFps, this.currentTickRate * 0.8)));
            return;
        }

        this.setTickRate(Math_round(Math_max(desiredFps / 2, this.currentTickRate * 0.8)));
    }

    /**
     * Call whenever a tick began
     */
    beginTick() {
        assert(this.currentTickStart === null, "BeginTick called twice");
        this.currentTickStart = performanceNow();

        if (this.capturedTicks.length > this.currentTickRate * 2) {
            // Take only a portion of the ticks
            this.capturedTicks.sort();
            this.capturedTicks.splice(0, 10);
            this.capturedTicks.splice(this.capturedTicks.length - 11, 10);

            let average = 0;
            for (let i = 0; i < this.capturedTicks.length; ++i) {
                average += this.capturedTicks[i];
            }
            average /= this.capturedTicks.length;

            this.averageTickDuration = average;

            const desiredFps = this.root.app.settings.getDesiredFps();

            if (this.averageFps > desiredFps * 0.9) {
                // if (average < maxTickDuration) {
                this.increaseTickRate();
            } else if (this.averageFps < desiredFps * 0.7) {
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
