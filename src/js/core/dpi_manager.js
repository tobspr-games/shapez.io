import { globalConfig } from "../core/config";
import { round1Digit, round2Digits } from "./utils";

/**
 * Returns the current dpi
 * @returns {number}
 */
export function getDeviceDPI() {
    return window.devicePixelRatio || 1;
}

/**
 *
 * @param {number} dpi
 * @returns {number} Smoothed dpi
 */
export function smoothenDpi(dpi) {
    if (dpi < 0.05) {
        return 0.05;
    } else if (dpi < 0.2) {
        return round2Digits(Math.round(dpi / 0.04) * 0.04);
    } else if (dpi < 1) {
        return round1Digit(Math.round(dpi / 0.1) * 0.1);
    } else if (dpi < 4) {
        return round1Digit(Math.round(dpi / 0.5) * 0.5);
    } else {
        return 4;
    }
}

// Initial dpi
// setDPIMultiplicator(1);

/**
 * Prepares a context for hihg dpi rendering
 * @param {CanvasRenderingContext2D} context
 */
export function prepareHighDPIContext(context, smooth = true) {
    const dpi = getDeviceDPI();
    context.scale(dpi, dpi);

    if (smooth) {
        context.imageSmoothingEnabled = true;
        context.webkitImageSmoothingEnabled = true;

        // @ts-ignore
        context.imageSmoothingQuality = globalConfig.smoothing.quality;
    } else {
        context.imageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
    }
}

/**
 * Resizes a high dpi canvas
 * @param {HTMLCanvasElement} canvas
 * @param {number} w
 * @param {number} h
 */
export function resizeHighDPICanvas(canvas, w, h, smooth = true) {
    const dpi = getDeviceDPI();

    const wNumber = Math.floor(w);
    const hNumber = Math.floor(h);

    const targetW = Math.floor(wNumber * dpi);
    const targetH = Math.floor(hNumber * dpi);

    if (targetW !== canvas.width || targetH !== canvas.height) {
        // console.log("Resize Canvas from", canvas.width, canvas.height, "to", targetW, targetH)
        canvas.width = targetW;
        canvas.height = targetH;
        canvas.style.width = wNumber + "px";
        canvas.style.height = hNumber + "px";
        prepareHighDPIContext(canvas.getContext("2d"), smooth);
    }
}

/**
 * Resizes a canvas
 * @param {HTMLCanvasElement} canvas
 * @param {number} w
 * @param {number} h
 */
export function resizeCanvas(canvas, w, h, setStyle = true) {
    const actualW = Math.ceil(w);
    const actualH = Math.ceil(h);
    if (actualW !== canvas.width || actualH !== canvas.height) {
        canvas.width = actualW;
        canvas.height = actualH;
        if (setStyle) {
            canvas.style.width = actualW + "px";
            canvas.style.height = actualH + "px";
        }
        // console.log("Resizing canvas to", actualW, "x", actualH);
    }
}

/**
 * Resizes a canvas and makes sure its cleared
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} context
 * @param {number} w
 * @param {number} h
 */
export function resizeCanvasAndClear(canvas, context, w, h) {
    const actualW = Math.ceil(w);
    const actualH = Math.ceil(h);
    if (actualW !== canvas.width || actualH !== canvas.height) {
        canvas.width = actualW;
        canvas.height = actualH;
        canvas.style.width = actualW + "px";
        canvas.style.height = actualH + "px";
        // console.log("Resizing canvas to", actualW, "x", actualH);
    } else {
        context.clearRect(0, 0, actualW, actualH);
    }
}
