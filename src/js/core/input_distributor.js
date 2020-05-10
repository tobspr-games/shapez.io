/* typehints:start */
import { Application } from "../application";
import { InputReceiver } from "./input_receiver";
/* typehints:end */

import { Signal, STOP_PROPAGATION } from "./signal";
import { createLogger } from "./logging";
import { arrayDeleteValue, fastArrayDeleteValue } from "./utils";

const logger = createLogger("input_distributor");

export class InputDistributor {
    /**
     *
     * @param {Application} app
     */
    constructor(app) {
        this.app = app;

        /** @type {Array<InputReceiver>} */
        this.recieverStack = [];

        /** @type {Array<function(any) : boolean>} */
        this.filters = [];

        this.shiftIsDown = false;
        this.altIsDown = false;

        this.bindToEvents();
    }

    /**
     * Attaches a new filter which can filter and reject events
     * @param {function(any): boolean} filter
     */
    installFilter(filter) {
        this.filters.push(filter);
    }

    /**
     * Removes an attached filter
     * @param {function(any) : boolean} filter
     */
    dismountFilter(filter) {
        fastArrayDeleteValue(this.filters, filter);
    }

    /**
     * @param {InputReceiver} reciever
     */
    pushReciever(reciever) {
        if (this.isRecieverAttached(reciever)) {
            assert(false, "Can not add reciever " + reciever.context + " twice");
            logger.error("Can not add reciever", reciever.context, "twice");
            return;
        }
        this.recieverStack.push(reciever);

        if (this.recieverStack.length > 10) {
            logger.error(
                "Reciever stack is huge, probably some dead receivers arround:",
                this.recieverStack.map(x => x.context)
            );
        }
    }

    /**
     * @param {InputReceiver} reciever
     */
    popReciever(reciever) {
        if (this.recieverStack.indexOf(reciever) < 0) {
            assert(false, "Can not pop reciever " + reciever.context + "  since its not contained");
            logger.error("Can not pop reciever", reciever.context, "since its not contained");
            return;
        }
        if (this.recieverStack[this.recieverStack.length - 1] !== reciever) {
            logger.warn(
                "Popping reciever",
                reciever.context,
                "which is not on top of the stack. Stack is: ",
                this.recieverStack.map(x => x.context)
            );
        }
        arrayDeleteValue(this.recieverStack, reciever);
    }

    /**
     * @param {InputReceiver} reciever
     */
    isRecieverAttached(reciever) {
        return this.recieverStack.indexOf(reciever) >= 0;
    }

    /**
     * @param {InputReceiver} reciever
     */
    isRecieverOnTop(reciever) {
        return (
            this.isRecieverAttached(reciever) &&
            this.recieverStack[this.recieverStack.length - 1] === reciever
        );
    }

    /**
     * @param {InputReceiver} reciever
     */
    makeSureAttachedAndOnTop(reciever) {
        this.makeSureDetached(reciever);
        this.pushReciever(reciever);
    }

    /**
     * @param {InputReceiver} reciever
     */
    makeSureDetached(reciever) {
        if (this.isRecieverAttached(reciever)) {
            arrayDeleteValue(this.recieverStack, reciever);
        }
    }

    /**
     *
     * @param {InputReceiver} reciever
     */
    destroyReceiver(reciever) {
        this.makeSureDetached(reciever);
        reciever.cleanup();
    }

    // Internal

    getTopReciever() {
        if (this.recieverStack.length > 0) {
            return this.recieverStack[this.recieverStack.length - 1];
        }
        return null;
    }

    bindToEvents() {
        window.addEventListener("popstate", this.handleBackButton.bind(this), false);
        document.addEventListener("backbutton", this.handleBackButton.bind(this), false);
        window.addEventListener("keydown", this.handleKeydown.bind(this));
        window.addEventListener("keyup", this.handleKeyup.bind(this));
        window.addEventListener("blur", this.handleBlur.bind(this));
    }

    forwardToReceiver(eventId, payload = null) {
        // Check filters
        for (let i = 0; i < this.filters.length; ++i) {
            if (!this.filters[i](eventId)) {
                return STOP_PROPAGATION;
            }
        }

        const reciever = this.getTopReciever();
        if (!reciever) {
            logger.warn("Dismissing event because not reciever was found:", eventId);
            return;
        }
        const signal = reciever[eventId];
        assert(signal instanceof Signal, "Not a valid event id");
        return signal.dispatch(payload);
    }

    /**
     * @param {Event} event
     */
    handleBackButton(event) {
        event.preventDefault();
        event.stopPropagation();
        this.forwardToReceiver("backButton");
    }

    /**
     * Handles when the page got blurred
     */
    handleBlur() {
        this.shiftIsDown = false;
        this.altIsDown = false;
        this.forwardToReceiver("pageBlur", {});
        this.forwardToReceiver("shiftUp", {});
    }

    /**
     * @param {KeyboardEvent} event
     */
    handleKeydown(event) {
        if (event.keyCode === 16) {
            this.shiftIsDown = true;
        }
        if (event.keyCode === 18) {
            this.altIsDown = true;
        }

        if (
            // TAB
            event.keyCode === 9 ||
            // F1 - F10
            (event.keyCode >= 112 && event.keyCode < 122 && !G_IS_DEV)
        ) {
            event.preventDefault();
        }

        if (
            this.forwardToReceiver("keydown", {
                keyCode: event.keyCode,
                shift: event.shiftKey,
                alt: event.altKey,
                event,
            }) === STOP_PROPAGATION
        ) {
            return;
        }

        const code = event.keyCode;
        if (code === 27) {
            // Escape key
            event.preventDefault();
            event.stopPropagation();
            return this.forwardToReceiver("backButton");
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    handleKeyup(event) {
        if (event.keyCode === 16) {
            this.shiftIsDown = false;
            this.forwardToReceiver("shiftUp", {});
        }
        if (event.keyCode === 18) {
            this.altIsDown = false;
            this.forwardToReceiver("altUp", {});
        }

        this.forwardToReceiver("keyup", {
            keyCode: event.keyCode,
            shift: event.shiftKey,
            alt: event.altKey,
        });
    }
}
