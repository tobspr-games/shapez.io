import { Rectangle } from "./rectangle";

/* typehints:start */
import { GameRoot } from "../game/root";
/* typehints:end */

export class DrawParameters {
    constructor({ context, visibleRect, desiredAtlasScale, zoomLevel, root }) {
        /** @type {CanvasRenderingContext2D} */
        this.context = context;

        /** @type {Rectangle} */
        this.visibleRect = visibleRect;

        /** @type {number} */
        this.desiredAtlasScale = desiredAtlasScale;

        /** @type {number} */
        this.zoomLevel = zoomLevel;

        // FIXME: Not really nice
        /** @type {GameRoot} */
        this.root = root;
    }
}
