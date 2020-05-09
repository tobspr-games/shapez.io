// We clamp high deltas so 30 fps is fairly ok
const bgFps = 30;
const desiredMsDelay = 1000 / bgFps;

let lastTick = 0;

function tick() {
    const now = performance.now();
    const delta = now - lastTick;
    lastTick = now;

    // @ts-ignore
    postMessage({ delta });
}

setInterval(tick, desiredMsDelay);
