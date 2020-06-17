import { performanceNow } from "../core/builtins";
import { createLogger } from "../core/logging";
import { Signal } from "../core/signal";
import { fastArrayDelete, fastArrayDeleteValueIfContained } from "./utils";
import { Vector } from "./vector";
import { IS_MOBILE, SUPPORT_TOUCH } from "./config";
import { SOUNDS } from "../platform/sound";
import { GLOBAL_APP } from "./globals";

const logger = createLogger("click_detector");

export const MAX_MOVE_DISTANCE_PX = IS_MOBILE ? 20 : 80;

// For debugging
const registerClickDetectors = G_IS_DEV && true;
if (registerClickDetectors) {
    /** @type {Array<ClickDetector>} */
    window.activeClickDetectors = [];
}

// Store active click detectors so we can cancel them
/** @type {Array<ClickDetector>} */
const ongoingClickDetectors = [];

// Store when the last touch event was registered, to avoid accepting a touch *and* a click event

export let clickDetectorGlobals = {
    lastTouchTime: -1000,
};

/**
 * Click detector creation payload typehints
 * @typedef {{
 *  consumeEvents?: boolean,
 *  preventDefault?: boolean,
 *  applyCssClass?: string,
 *  captureTouchmove?: boolean,
 *  targetOnly?: boolean,
 *  maxDistance?: number,
 *  clickSound?: string,
 *  preventClick?: boolean,
 * }} ClickDetectorConstructorArgs
 */

// Detects clicks
export class ClickDetector {
    /**
     *
     * @param {Element} element
     * @param {object} param1
     * @param {boolean=} param1.consumeEvents Whether to call stopPropagation
     *                                       (Useful for nested elements where the parent has a click handler as wel)
     * @param {boolean=} param1.preventDefault  Whether to call preventDefault (Usually makes the handler faster)
     * @param {string=} param1.applyCssClass The css class to add while the element is pressed
     * @param {boolean=} param1.captureTouchmove Whether to capture touchmove events as well
     * @param {boolean=} param1.targetOnly Whether to also accept clicks on child elements (e.target !== element)
     * @param {number=} param1.maxDistance The maximum distance in pixels to accept clicks
     * @param {string=} param1.clickSound Sound key to play on touchdown
     * @param {boolean=} param1.preventClick Whether to prevent click events
     */
    constructor(
        element,
        {
            consumeEvents = false,
            preventDefault = true,
            applyCssClass = "pressed",
            captureTouchmove = false,
            targetOnly = false,
            maxDistance = MAX_MOVE_DISTANCE_PX,
            clickSound = SOUNDS.uiClick,
            preventClick = false,
        }
    ) {
        assert(element, "No element given!");
        this.clickDownPosition = null;

        this.consumeEvents = consumeEvents;
        this.preventDefault = preventDefault;
        this.applyCssClass = applyCssClass;
        this.captureTouchmove = captureTouchmove;
        this.targetOnly = targetOnly;
        this.clickSound = clickSound;
        this.maxDistance = maxDistance;
        this.preventClick = preventClick;

        // Signals
        this.click = new Signal();
        this.rightClick = new Signal();
        this.touchstart = new Signal();
        this.touchmove = new Signal();
        this.touchend = new Signal();
        this.touchcancel = new Signal();

        // Simple signals which just receive the touch position
        this.touchstartSimple = new Signal();
        this.touchmoveSimple = new Signal();
        this.touchendSimple = new Signal();

        // Store time of touch start
        this.clickStartTime = null;

        // A click can be cancelled if another detector registers a click
        this.cancelled = false;

        this.internalBindTo(/** @type {HTMLElement} */ (element));
    }

    /**
     * Cleans up all event listeners of this detector
     */
    cleanup() {
        if (this.element) {
            if (registerClickDetectors) {
                const index = window.activeClickDetectors.indexOf(this);
                if (index < 0) {
                    logger.error("Click detector cleanup but is not active");
                } else {
                    window.activeClickDetectors.splice(index, 1);
                }
            }
            const options = this.internalGetEventListenerOptions();

            if (SUPPORT_TOUCH) {
                this.element.removeEventListener("touchstart", this.handlerTouchStart, options);
                this.element.removeEventListener("touchend", this.handlerTouchEnd, options);
                this.element.removeEventListener("touchcancel", this.handlerTouchCancel, options);
            }

            this.element.removeEventListener("mouseup", this.handlerTouchStart, options);
            this.element.removeEventListener("mousedown", this.handlerTouchEnd, options);
            this.element.removeEventListener("mouseout", this.handlerTouchCancel, options);

            if (this.captureTouchmove) {
                if (SUPPORT_TOUCH) {
                    this.element.removeEventListener("touchmove", this.handlerTouchMove, options);
                }
                this.element.removeEventListener("mousemove", this.handlerTouchMove, options);
            }

            if (this.preventClick) {
                this.element.removeEventListener("click", this.handlerPreventClick, options);
            }

            this.click.removeAll();
            this.touchstart.removeAll();
            this.touchmove.removeAll();
            this.touchend.removeAll();
            this.touchcancel.removeAll();

            // TODO: Remove pointer captures

            this.element = null;
        }
    }

    // INTERNAL METHODS

    /**
     *
     * @param {Event} event
     */
    internalPreventClick(event) {
        window.focus();
        event.preventDefault();
    }

    /**
     * Internal method to get the options to pass to an event listener
     */
    internalGetEventListenerOptions() {
        return {
            capture: this.consumeEvents,
            passive: !this.preventDefault,
        };
    }

    /**
     * Binds the click detector to an element
     * @param {HTMLElement} element
     */
    internalBindTo(element) {
        const options = this.internalGetEventListenerOptions();

        this.handlerTouchStart = this.internalOnPointerDown.bind(this);
        this.handlerTouchEnd = this.internalOnPointerEnd.bind(this);
        this.handlerTouchMove = this.internalOnPointerMove.bind(this);
        this.handlerTouchCancel = this.internalOnTouchCancel.bind(this);

        if (this.preventClick) {
            this.handlerPreventClick = this.internalPreventClick.bind(this);
            element.addEventListener("click", this.handlerPreventClick, options);
        }

        if (SUPPORT_TOUCH) {
            element.addEventListener("touchstart", this.handlerTouchStart, options);
            element.addEventListener("touchend", this.handlerTouchEnd, options);
            element.addEventListener("touchcancel", this.handlerTouchCancel, options);
        }

        element.addEventListener("mousedown", this.handlerTouchStart, options);
        element.addEventListener("mouseup", this.handlerTouchEnd, options);
        element.addEventListener("mouseout", this.handlerTouchCancel, options);

        if (this.captureTouchmove) {
            if (SUPPORT_TOUCH) {
                element.addEventListener("touchmove", this.handlerTouchMove, options);
            }
            element.addEventListener("mousemove", this.handlerTouchMove, options);
        }

        if (registerClickDetectors) {
            window.activeClickDetectors.push(this);
        }
        this.element = element;
    }

    /**
     * Returns if the bound element is currently in the DOM.
     */
    internalIsDomElementAttached() {
        return this.element && document.documentElement.contains(this.element);
    }

    /**
     * Checks if the given event is relevant for this detector
     * @param {TouchEvent|MouseEvent} event
     */
    internalEventPreHandler(event, expectedRemainingTouches = 1) {
        if (!this.element) {
            // Already cleaned up
            return false;
        }

        if (this.targetOnly && event.target !== this.element) {
            // Clicked a child element
            return false;
        }

        // Stop any propagation and defaults if configured
        if (this.consumeEvents && event.cancelable) {
            event.stopPropagation();
        }

        if (this.preventDefault && event.cancelable) {
            event.preventDefault();
        }

        if (window.TouchEvent && event instanceof TouchEvent) {
            clickDetectorGlobals.lastTouchTime = performanceNow();

            // console.log("Got touches", event.targetTouches.length, "vs", expectedRemainingTouches);
            if (event.targetTouches.length !== expectedRemainingTouches) {
                return false;
            }
        }

        if (event instanceof MouseEvent) {
            if (performanceNow() - clickDetectorGlobals.lastTouchTime < 1000.0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Extracts the mous position from an event
     * @param {TouchEvent|MouseEvent} event
     * @returns {Vector} The client space position
     */
    static extractPointerPosition(event) {
        if (window.TouchEvent && event instanceof TouchEvent) {
            if (event.changedTouches.length !== 1) {
                logger.warn(
                    "Got unexpected target touches:",
                    event.targetTouches.length,
                    "->",
                    event.targetTouches
                );
                return new Vector(0, 0);
            }

            const touch = event.changedTouches[0];
            return new Vector(touch.clientX, touch.clientY);
        }

        if (event instanceof MouseEvent) {
            return new Vector(event.clientX, event.clientY);
        }

        assertAlways(false, "Got unknown event: " + event);

        return new Vector(0, 0);
    }

    /**
     * Cacnels all ongoing events on this detector
     */
    cancelOngoingEvents() {
        if (this.applyCssClass && this.element) {
            this.element.classList.remove(this.applyCssClass);
        }
        this.clickDownPosition = null;
        this.clickStartTime = null;
        this.cancelled = true;
        fastArrayDeleteValueIfContained(ongoingClickDetectors, this);
    }

    /**
     * Internal pointer down handler
     * @param {TouchEvent|MouseEvent} event
     */
    internalOnPointerDown(event) {
        window.focus();

        if (!this.internalEventPreHandler(event, 1)) {
            return false;
        }

        const position = /** @type {typeof ClickDetector} */ (this.constructor).extractPointerPosition(event);

        if (event instanceof MouseEvent) {
            const isRightClick = event.button === 2;
            if (isRightClick) {
                // Ignore right clicks
                this.rightClick.dispatch(position, event);
                this.cancelled = true;
                return;
            }
        }

        if (this.clickDownPosition) {
            logger.warn("Ignoring double click");
            return false;
        }

        this.cancelled = false;
        this.touchstart.dispatch(event);

        // Store where the touch started
        this.clickDownPosition = position;
        this.clickStartTime = performanceNow();
        this.touchstartSimple.dispatch(this.clickDownPosition.x, this.clickDownPosition.y);

        // If we are not currently within a click, register it
        if (ongoingClickDetectors.indexOf(this) < 0) {
            ongoingClickDetectors.push(this);
        } else {
            logger.warn("Click detector got pointer down of active pointer twice");
        }

        // If we should apply any classes, do this now
        if (this.applyCssClass) {
            this.element.classList.add(this.applyCssClass);
        }

        // If we should play any sound, do this
        if (this.clickSound) {
            GLOBAL_APP.sound.playUiSound(this.clickSound);
        }

        return false;
    }

    /**
     * Internal pointer move handler
     * @param {TouchEvent|MouseEvent} event
     */
    internalOnPointerMove(event) {
        if (!this.internalEventPreHandler(event, 1)) {
            return false;
        }
        this.touchmove.dispatch(event);
        const pos = /** @type {typeof ClickDetector} */ (this.constructor).extractPointerPosition(event);
        this.touchmoveSimple.dispatch(pos.x, pos.y);
        return false;
    }

    /**
     * Internal pointer end handler
     * @param {TouchEvent|MouseEvent} event
     */
    internalOnPointerEnd(event) {
        window.focus();

        if (!this.internalEventPreHandler(event, 0)) {
            return false;
        }

        if (this.cancelled) {
            // warn(this, "Not dispatching touchend on cancelled listener");
            return false;
        }

        if (event instanceof MouseEvent) {
            const isRightClick = event.button === 2;
            if (isRightClick) {
                return;
            }
        }

        const index = ongoingClickDetectors.indexOf(this);
        if (index < 0) {
            logger.warn("Got pointer end but click detector is not in pressed state");
        } else {
            fastArrayDelete(ongoingClickDetectors, index);
        }

        let dispatchClick = false;
        let dispatchClickPos = null;

        // Check for correct down position, otherwise must have pinched or so
        if (this.clickDownPosition) {
            const pos = /** @type {typeof ClickDetector} */ (this.constructor).extractPointerPosition(event);
            const distance = pos.distance(this.clickDownPosition);
            if (!IS_MOBILE || distance <= this.maxDistance) {
                dispatchClick = true;
                dispatchClickPos = pos;
            } else {
                console.warn("[ClickDetector] Touch does not count as click:", "(was", distance, ")");
            }
        }

        this.clickDownPosition = null;
        this.clickStartTime = null;

        if (this.applyCssClass) {
            this.element.classList.remove(this.applyCssClass);
        }

        // Dispatch in the end to avoid the element getting invalidated
        // Also make sure that the element is still in the dom
        if (this.internalIsDomElementAttached()) {
            this.touchend.dispatch(event);
            this.touchendSimple.dispatch();

            if (dispatchClick) {
                const detectors = ongoingClickDetectors.slice();
                for (let i = 0; i < detectors.length; ++i) {
                    detectors[i].cancelOngoingEvents();
                }
                this.click.dispatch(dispatchClickPos, event);
            }
        }
        return false;
    }

    /**
     * Internal touch cancel handler
     * @param {TouchEvent|MouseEvent} event
     */
    internalOnTouchCancel(event) {
        if (!this.internalEventPreHandler(event, 0)) {
            return false;
        }

        if (this.cancelled) {
            // warn(this, "Not dispatching touchcancel on cancelled listener");
            return false;
        }

        this.cancelOngoingEvents();
        this.touchcancel.dispatch(event);
        this.touchendSimple.dispatch(event);
        return false;
    }
}
