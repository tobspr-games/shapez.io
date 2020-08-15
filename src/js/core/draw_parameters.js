import { globalConfig } from "./config";

/**
 * @typedef {import("../game/root").GameRoot} GameRoot
 * @typedef {import("./rectangle").Rectangle} Rectangle
 */

export class DrawParameters {
    constructor({ context, visibleRect, desiredAtlasScale, zoomLevel, root }) {
        /** @type {CanvasRenderingContext2D} */
        this.context = context;

        /** @type {Rectangle} */
        this.visibleRect = visibleRect;

        /** @type {string} */
        this.desiredAtlasScale = desiredAtlasScale;

        /** @type {number} */
        this.zoomLevel = zoomLevel;

        // FIXME: Not really nice
        /** @type {GameRoot} */
        this.root = root;
    }
}
