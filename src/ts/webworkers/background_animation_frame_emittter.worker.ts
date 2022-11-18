// We clamp high deltas so 30 fps is fairly ok
const bgFps: any = 30;
const desiredMsDelay: any = 1000 / bgFps;
let lastTick: any = performance.now();
function tick(): any {
    const now: any = performance.now();
    const delta: any = now - lastTick;
    lastTick = now;
    // @ts-ignore
    self.postMessage({ delta });
}
setInterval(tick, desiredMsDelay);
