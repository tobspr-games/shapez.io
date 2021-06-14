import { GameRoot } from "./root";
import { createLogger } from "../core/logging";
import { globalConfig } from "../core/config";

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

        const fixedRate = this.root.gameMode.getFixedTickrate();
        if (fixedRate) {
            logger.log("Setting fixed tickrate of", fixedRate);
            this.setTickRate(fixedRate);
        } else {
            this.setTickRate(this.root.app.settings.getDesiredFps());

            if (G_IS_DEV && globalConfig.debug.renderForTrailer) {
                this.setTickRate(300);
            }
        }
    }

    onFrameRendered() {
        ++this.accumulatedFps;

        const now = performance.now();
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
        if (G_IS_DEV && globalConfig.debug.renderForTrailer) {
            return;
        }

        const desiredFps = this.root.app.settings.getDesiredFps();
        this.setTickRate(Math.round(Math.min(desiredFps, this.currentTickRate * 1.2)));
    }

    /**
     * Decreases the tick rate marginally
     */
    decreaseTickRate() {
        if (G_IS_DEV && globalConfig.debug.renderForTrailer) {
            return;
        }

        const desiredFps = this.root.app.settings.getDesiredFps();
        this.setTickRate(Math.round(Math.max(desiredFps / 2, this.currentTickRate * 0.8)));
    }

    /**
     * Call whenever a tick began
     */
    beginTick() {
        assert(this.currentTickStart === null, "BeginTick called twice");
        this.currentTickStart = performance.now();

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

            // Disabled for now: Dynamically adjusting tick rate
            // if (this.averageFps > desiredFps * 0.9) {
            //     // if (average < maxTickDuration) {
            //     this.increaseTickRate();
            // } else if (this.averageFps < desiredFps * 0.7) {
            //     this.decreaseTickRate();
            // }

            this.capturedTicks = [];
        }
    }

    /**
     * Call whenever a tick ended
     */
    endTick() {
        assert(this.currentTickStart !== null, "EndTick called without BeginTick");
        const duration = performance.now() - this.currentTickStart;
        this.capturedTicks.push(duration);
        this.currentTickStart = null;
    }
}
