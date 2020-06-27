import { Signal } from "./signal";

// @ts-ignore
import BackgroundAnimationFrameEmitterWorker from "../webworkers/background_animation_frame_emittter.worker";

import { createLogger } from "./logging";
const logger = createLogger("animation_frame");

const maxDtMs = 1000;
const resetDtMs = 16;

export class AnimationFrame {
    constructor() {
        this.frameEmitted = new Signal();
        this.bgFrameEmitted = new Signal();

        this.lastTime = null;
        this.bgLastTime = null;

        this.boundMethod = this.handleAnimationFrame.bind(this);

        /** @type {Worker} */
        this.backgroundWorker = new BackgroundAnimationFrameEmitterWorker();
        this.backgroundWorker.addEventListener("error", err => {
            logger.error("Error in background fps worker:", err);
        });
        this.backgroundWorker.addEventListener("message", this.handleBackgroundTick.bind(this));
    }

    /**
     *
     * @param {MessageEvent} event
     */
    handleBackgroundTick(event) {
        const time = performance.now();
        if (!this.bgLastTime) {
            // First update, first delta is always 16ms
            this.bgFrameEmitted.dispatch(1000 / 60);
        } else {
            let dt = time - this.bgLastTime;
            if (dt > maxDtMs) {
                dt = resetDtMs;
            }
            this.bgFrameEmitted.dispatch(dt);
        }
        this.bgLastTime = time;
    }

    start() {
        assertAlways(window.requestAnimationFrame, "requestAnimationFrame is not supported!");
        this.handleAnimationFrame();
    }

    handleAnimationFrame(time) {
        if (!this.lastTime) {
            // First update, first delta is always 16ms
            this.frameEmitted.dispatch(1000 / 60);
        } else {
            let dt = time - this.lastTime;
            if (dt > maxDtMs) {
                // warn(this, "Clamping", dt, "to", resetDtMs);
                dt = resetDtMs;
            }
            this.frameEmitted.dispatch(dt);
        }
        this.lastTime = time;
        window.requestAnimationFrame(this.boundMethod);
    }
}
