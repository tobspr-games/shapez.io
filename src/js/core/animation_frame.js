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

        this.lastTime = performance.now();
        this.bgLastTime = performance.now();

        this.boundMethod = this.handleAnimationFrame.bind(this);

        this.backgroundWorker = new BackgroundAnimationFrameEmitterWorker();
        this.backgroundWorker.addEventListener("error", err => {
            logger.error("Error in background fps worker:", err);
        });
        this.backgroundWorker.addEventListener("message", this.handleBackgroundTick.bind(this));
    }

    handleBackgroundTick() {
        const time = performance.now();

        let dt = time - this.bgLastTime;

        if (dt > maxDtMs) {
            dt = resetDtMs;
        }

        this.bgFrameEmitted.dispatch(dt);
        this.bgLastTime = time;
    }

    start() {
        assertAlways(window.requestAnimationFrame, "requestAnimationFrame is not supported!");
        this.handleAnimationFrame();
    }

    handleAnimationFrame(time) {
        let dt = time - this.lastTime;

        if (dt > maxDtMs) {
            dt = resetDtMs;
        }

        this.frameEmitted.dispatch(dt);
        this.lastTime = time;

        window.requestAnimationFrame(this.boundMethod);
    }
}
