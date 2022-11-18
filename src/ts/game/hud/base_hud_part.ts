/* typehints:start */
import type { GameRoot } from "../root";
import type { DrawParameters } from "../../core/draw_parameters";
/* typehints:end */
import { ClickDetector } from "../../core/click_detector";
import { KeyActionMapper } from "../key_action_mapper";
export class BaseHUDPart {
    public root = root;
    public clickDetectors: Array<ClickDetector> = [];

        constructor(root) {
    }
    /**
     * Should create all require elements
     */
    createElements(parent: HTMLElement) { }
    /**
     * Should initialize the element, called *after* the elements have been created
     * @abstract
     */
    initialize() {
        abstract;
    }
    /**
     * Should update any required logic
     */
    update() { }
    /**
     * Should draw the hud
     */
    draw(parameters: DrawParameters) { }
    /**
     * Should draw any overlays (screen space)
     */
    drawOverlays(parameters: DrawParameters) { }
    /**
     * Should return true if the widget has a modal dialog opened and thus
     * the game does not need to update / redraw
     * {}
     */
    shouldPauseRendering(): boolean {
        return false;
    }
    /**
     * Should return false if the game should be paused
     * {}
     */
    shouldPauseGame(): boolean {
        return false;
    }
    /**
     * Should return true if this overlay is open and currently blocking any user interaction
     */
    isBlockingOverlay() {
        return false;
    }
    /**
     * Cleans up the hud element, if overridden make sure to call super.cleanup
     */
    cleanup() {
        this.cleanupClickDetectors();
    }
    /**
     * Cleans up all click detectors
     */
    cleanupClickDetectors() {
        if (this.clickDetectors) {
            for (let i = 0; i < this.clickDetectors.length; ++i) {
                this.clickDetectors[i].cleanup();
            }
            this.clickDetectors = [];
        }
    }
    /**
     * Should close the element, in case its supported
     */
    close() { }
    // Helpers
    /**
     * Helper method to construct a new click detector
     */
    trackClicks(element: Element, handler: function, args: import("../../core/click_detector").ClickDetectorConstructorArgs= = {}) {
        const detector = new ClickDetector(element, args);
        detector.click.add(handler, this);
        this.registerClickDetector(detector);
    }
    /**
     * Registers a new click detector
     */
    registerClickDetector(detector: ClickDetector) {
        this.clickDetectors.push(detector);
        if (G_IS_DEV) {
            // @ts-ignore

            detector._src = "hud-" + this.constructor.name;
        }
    }
    /**
     * Closes this element when its background is clicked
     */
    closeOnBackgroundClick(element: HTMLElement, closeMethod: function = null) {
        const bgClickDetector = new ClickDetector(element, {
            preventDefault: true,
            targetOnly: true,
            applyCssClass: null,
            consumeEvents: true,
            clickSound: null,
        });
        // If the state defines a close method, use that as fallback
        // @ts-ignore
        bgClickDetector.touchend.add(closeMethod || this.close, this);
        this.registerClickDetector(bgClickDetector);
    }
    /**
     * Forwards the game speed keybindings so you can toggle pause / Fastforward
     * in the building tooltip and such
     */
    forwardGameSpeedKeybindings(sourceMapper: KeyActionMapper) {
        sourceMapper.forward(this.root.keyMapper, ["gamespeed_pause", "gamespeed_fastforward"]);
    }
    /**
     * Forwards the map movement keybindings so you can move the map with the
     * arrow keys
     */
    forwardMapMovementKeybindings(sourceMapper: KeyActionMapper) {
        sourceMapper.forward(this.root.keyMapper, [
            "mapMoveUp",
            "mapMoveRight",
            "mapMoveDown",
            "mapMoveLeft",
        ]);
    }
}
