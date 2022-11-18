import { Signal } from "./signal";
// @ts-ignore
import BackgroundAnimationFrameEmitterWorker from "../webworkers/background_animation_frame_emittter.worker";
import { createLogger } from "./logging";
const logger = createLogger("animation_frame");
const maxDtMs = 1000;
const resetDtMs = 16;
export class AnimationFrame {
    public frameEmitted = new Signal();
    public bgFrameEmitted = new Signal();
    public lastTime = performance.now();
    public bgLastTime = performance.now();
    public boundMethod = this.handleAnimationFrame.bind(this);
    public backgroundWorker = new BackgroundAnimationFrameEmitterWorker();

    constructor() {
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
        try {
            this.frameEmitted.dispatch(dt);
        }
        catch (ex) {
            console.error(ex);
        }
        this.lastTime = time;
        window.requestAnimationFrame(this.boundMethod);
    }
}
