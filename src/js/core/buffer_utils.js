import { globalConfig } from "./config";
import { fastArrayDelete } from "./utils";
import { createLogger } from "./logging";

const logger = createLogger("buffer_utils");

/**
 * Enables images smoothing on a context
 * @param {CanvasRenderingContext2D} context
 */
export function enableImageSmoothing(context) {
    context.imageSmoothingEnabled = true;
    context.webkitImageSmoothingEnabled = true;

    // @ts-ignore
    context.imageSmoothingQuality = globalConfig.smoothing.quality;
}

/**
 * Disables image smoothing on a context
 * @param {CanvasRenderingContext2D} context
 */
export function disableImageSmoothing(context) {
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
}

const registeredCanvas = [];
const freeCanvasList = [];

let vramUsage = 0;
let bufferCount = 0;

/**
 *
 * @param {HTMLCanvasElement} canvas
 */
export function getBufferVramUsageBytes(canvas) {
    return canvas.width * canvas.height * 4;
}

/**
 * Returns stats on the allocated buffers
 */
export function getBufferStats() {
    return {
        vramUsage,
        bufferCount,
        backlog: freeCanvasList.length,
    };
}

export function clearBufferBacklog() {
    while (freeCanvasList.length > 50) {
        freeCanvasList.pop();
    }
}

/**
 * Creates a new offscreen buffer
 * @param {Number} w
 * @param {Number} h
 * @returns {[HTMLCanvasElement, CanvasRenderingContext2D]}
 */
export function makeOffscreenBuffer(w, h, { smooth = true, reusable = true, label = "buffer" }) {
    assert(w > 0 && h > 0, "W or H < 0");
    if (w % 1 !== 0 || h % 1 !== 0) {
        // console.warn("Subpixel offscreen buffer size:", w, h);
    }
    if (w < 1 || h < 1) {
        logger.error("Offscreen buffer size < 0:", w, "x", h);
        w = Math.max(1, w);
        h = Math.max(1, h);
    }

    const recommendedSize = 1024 * 1024;
    if (w * h > recommendedSize) {
        logger.warn("Creating huge buffer:", w, "x", h, "with label", label);
    }

    w = Math.floor(w);
    h = Math.floor(h);

    let canvas = null;
    let context = null;

    let bestMatchingOne = null;
    let bestMatchingPixelsDiff = 1e50;

    const currentPixels = w * h;

    // Ok, search in cache first
    for (let i = 0; i < freeCanvasList.length; ++i) {
        const { canvas: useableCanvas, context: useableContext } = freeCanvasList[i];
        if (useableCanvas.width === w && useableCanvas.height === h) {
            // Ok we found one
            canvas = useableCanvas;
            context = useableContext;

            fastArrayDelete(freeCanvasList, i);
            break;
        }

        const otherPixels = useableCanvas.width * useableCanvas.height;
        const diff = Math.abs(otherPixels - currentPixels);
        if (diff < bestMatchingPixelsDiff) {
            bestMatchingPixelsDiff = diff;
            bestMatchingOne = {
                canvas: useableCanvas,
                context: useableContext,
                index: i,
            };
        }
    }

    // Ok none matching, reuse one though
    if (!canvas && bestMatchingOne) {
        canvas = bestMatchingOne.canvas;
        context = bestMatchingOne.context;
        canvas.width = w;
        canvas.height = h;
        fastArrayDelete(freeCanvasList, bestMatchingOne.index);
    }

    // Reset context
    if (context) {
        // Restore past state
        context.restore();
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);

        delete canvas.style.width;
        delete canvas.style.height;
    }

    // None found , create new one
    if (!canvas) {
        canvas = document.createElement("canvas");
        context = canvas.getContext("2d" /*, { alpha } */);

        canvas.width = w;
        canvas.height = h;

        // Initial state
        context.save();
    }

    canvas.label = label;

    if (smooth) {
        enableImageSmoothing(context);
    } else {
        disableImageSmoothing(context);
    }

    if (reusable) {
        registerCanvas(canvas, context);
    }

    return [canvas, context];
}

/**
 * Frees a canvas
 * @param {HTMLCanvasElement} canvas
 */
export function registerCanvas(canvas, context) {
    registeredCanvas.push({ canvas, context });

    bufferCount += 1;
    vramUsage += getBufferVramUsageBytes(canvas);
}

/**
 * Frees a canvas
 * @param {HTMLCanvasElement} canvas
 */
export function freeCanvas(canvas) {
    assert(canvas, "Canvas is empty");

    let index = -1;
    let data = null;
    for (let i = 0; i < registeredCanvas.length; ++i) {
        if (registeredCanvas[i].canvas === canvas) {
            index = i;
            data = registeredCanvas[i];
            break;
        }
    }

    if (index < 0) {
        logger.error("Tried to free unregistered canvas of size", canvas.width, canvas.height);
        return;
    }
    fastArrayDelete(registeredCanvas, index);
    freeCanvasList.push(data);

    bufferCount -= 1;
    vramUsage -= getBufferVramUsageBytes(canvas);
}
