import { STOP_PROPAGATION } from "../core/signal";
import { GameRoot } from "./root";
import { ClickDetector } from "../core/click_detector";
import { createLogger } from "../core/logging";

const logger = createLogger("canvas_click_interceptor");

export class CanvasClickInterceptor {
    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;

        this.root.signals.postLoadHook.add(this.initialize, this);
        this.root.signals.aboutToDestruct.add(this.cleanup, this);

        /** @type {Array<object>} */
        this.interceptors = [];
    }

    initialize() {
        this.clickDetector = new ClickDetector(this.root.canvas, {
            applyCssClass: null,
            captureTouchmove: false,
            targetOnly: true,
            preventDefault: true,
            maxDistance: 13,
            clickSound: null,
        });
        this.clickDetector.click.add(this.onCanvasClick, this);
        this.clickDetector.rightClick.add(this.onCanvasRightClick, this);

        if (this.root.hud.parts.buildingPlacer) {
            this.interceptors.push(this.root.hud.parts.buildingPlacer);
        }

        logger.log("Registered", this.interceptors.length, "interceptors");
    }

    cleanup() {
        if (this.clickDetector) {
            this.clickDetector.cleanup();
        }
        this.interceptors = [];
    }

    onCanvasClick(position, event, cancelAction = false) {
        if (!this.root.gameInitialized) {
            logger.warn("Skipping click outside of game initiaization!");
            return;
        }

        if (this.root.hud.hasBlockingOverlayOpen()) {
            return;
        }

        for (let i = 0; i < this.interceptors.length; ++i) {
            const interceptor = this.interceptors[i];
            if (interceptor.onCanvasClick(position, cancelAction) === STOP_PROPAGATION) {
                // log(this, "Interceptor", interceptor.constructor.name, "catched click");
                break;
            }
        }
    }

    onCanvasRightClick(position, event) {
        this.onCanvasClick(position, event, true);
    }
}
