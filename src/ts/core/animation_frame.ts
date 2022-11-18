import { Signal } from "./signal";
// @ts-ignore
import BackgroundAnimationFrameEmitterWorker from "../webworkers/background_animation_frame_emittter.worker";
import { createLogger } from "./logging";
const logger: any = createLogger("animation_frame");
const maxDtMs: any = 1000;
const resetDtMs: any = 16;
export class AnimationFrame {
    public frameEmitted = new Signal();
    public bgFrameEmitted = new Signal();
    public lastTime = performance.now();
    public bgLastTime = performance.now();
    public boundMethod = this.handleAnimationFrame.bind(this);
    public backgroundWorker = new BackgroundAnimationFrameEmitterWorker();

    constructor() {
        this.backgroundWorker.addEventListener("error", (err: any): any => {
            logger.error("Error in background fps worker:", err);
        });
        this.backgroundWorker.addEventListener("message", this.handleBackgroundTick.bind(this));
    }
    handleBackgroundTick(): any {
        const time: any = performance.now();
        let dt: any = time - this.bgLastTime;
        if (dt > maxDtMs) {
            dt = resetDtMs;
        }
        this.bgFrameEmitted.dispatch(dt);
        this.bgLastTime = time;
    }
    start(): any {
        assertAlways(window.requestAnimationFrame, "requestAnimationFrame is not supported!");
        this.handleAnimationFrame();
    }
    handleAnimationFrame(time: any): any {
        let dt: any = time - this.lastTime;
        if (dt > maxDtMs) {
            dt = resetDtMs;
        }
        try {
            this.frameEmitted.dispatch(dt);
        }
        catch (ex: any) {
            console.error(ex);
        }
        this.lastTime = time;
        window.requestAnimationFrame(this.boundMethod);
    }
}
