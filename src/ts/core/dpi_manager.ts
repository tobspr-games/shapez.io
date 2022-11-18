import { globalConfig } from "./config";
import { round1Digit, round2Digits } from "./utils";
/**
 * Returns the current dpi
 * {}
 */
export function getDeviceDPI(): number {
    return window.devicePixelRatio || 1;
}
/**
 *
 * {} Smoothed dpi
 */
export function smoothenDpi(dpi: number): number {
    if (dpi < 0.05) {
        return 0.05;
    }
    else if (dpi < 0.2) {
        return round2Digits(Math.round(dpi / 0.04) * 0.04);
    }
    else if (dpi < 1) {
        return round1Digit(Math.round(dpi / 0.1) * 0.1);
    }
    else if (dpi < 4) {
        return round1Digit(Math.round(dpi / 0.5) * 0.5);
    }
    else {
        return 4;
    }
}
// Initial dpi
// setDPIMultiplicator(1);
/**
 * Prepares a context for hihg dpi rendering
 */
export function prepareHighDPIContext(context: CanvasRenderingContext2D, smooth: any = true): any {
    const dpi: any = getDeviceDPI();
    context.scale(dpi, dpi);
    if (smooth) {
        context.imageSmoothingEnabled = true;
        context.webkitImageSmoothingEnabled = true;
        // @ts-ignore
        context.imageSmoothingQuality = globalConfig.smoothing.quality;
    }
    else {
        context.imageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
    }
}
/**
 * Resizes a high dpi canvas
 */
export function resizeHighDPICanvas(canvas: HTMLCanvasElement, w: number, h: number, smooth: any = true): any {
    const dpi: any = getDeviceDPI();
    const wNumber: any = Math.floor(w);
    const hNumber: any = Math.floor(h);
    const targetW: any = Math.floor(wNumber * dpi);
    const targetH: any = Math.floor(hNumber * dpi);
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
 */
export function resizeCanvas(canvas: HTMLCanvasElement, w: number, h: number, setStyle: any = true): any {
    const actualW: any = Math.ceil(w);
    const actualH: any = Math.ceil(h);
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
 */
export function resizeCanvasAndClear(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, w: number, h: number): any {
    const actualW: any = Math.ceil(w);
    const actualH: any = Math.ceil(h);
    if (actualW !== canvas.width || actualH !== canvas.height) {
        canvas.width = actualW;
        canvas.height = actualH;
        canvas.style.width = actualW + "px";
        canvas.style.height = actualH + "px";
        // console.log("Resizing canvas to", actualW, "x", actualH);
    }
    else {
        context.clearRect(0, 0, actualW, actualH);
    }
}
