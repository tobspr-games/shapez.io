// We clamp high deltas so 30 fps is fairly ok
var bgFps = 30;
var desiredMsDelay = 1000 / bgFps;

let lastTick = 0;

function tick() {
    var now = performance.now();
    var delta = now - lastTick;
    lastTick = now;

    // @ts-ignore
    postMessage({ delta });
}

setInterval(tick, desiredMsDelay);
