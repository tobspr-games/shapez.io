import { createLogger } from "./logging";
import { Rectangle } from "./rectangle";
import { globalConfig } from "./config";

const logger = createLogger("stale_areas");

export class StaleAreaDetector {
    /**
     *
     * @param {object} param0
     * @param {import("../game/root").GameRoot} param0.root
     * @param {string} param0.name The name for reference
     * @param {(Rectangle) => void} param0.recomputeMethod Method which recomputes the given area
     */
    constructor({ root, name, recomputeMethod }) {
        this.root = root;
        this.name = name;
        this.recomputeMethod = recomputeMethod;

        /** @type {Rectangle} */
        this.staleArea = null;
    }

    /**
     * Invalidates the given area
     * @param {Rectangle} area
     */
    invalidate(area) {
        // logger.log(this.name, "invalidated", area.toString());
        if (this.staleArea) {
            this.staleArea = this.staleArea.getUnion(area);
        } else {
            this.staleArea = area.clone();
        }
    }

    /**
     * Updates the stale area
     */
    update() {
        if (this.staleArea) {
            logger.log(this.name, "is recomputing", this.staleArea.toString());
            if (G_IS_DEV && globalConfig.debug.renderChanges) {
                this.root.hud.parts.changesDebugger.renderChange(this.name, this.staleArea, "#fd145b");
            }
            this.recomputeMethod(this.staleArea);
            this.staleArea = null;
        }
    }
}
