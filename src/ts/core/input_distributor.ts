import { Application } from "../application";
import type { InputReceiver } from "./input_receiver";

import { Signal, STOP_PROPAGATION } from "./signal";
import { createLogger } from "./logging";
import { arrayDeleteValue, fastArrayDeleteValue } from "./utils";
const logger = createLogger("input_distributor");
export class InputDistributor {
    public app: Application;
    public receiverStack: Array<InputReceiver> = [];
    public filters: Array<(arg: any) => boolean> = [];
    /** All keys which are currently down */
    public keysDown = new Set();

    constructor(app: Application) {
        this.app = app;
        this.bindToEvents();
    }

    /**
     * Attaches a new filter which can filter and reject events
     */
    installFilter(filter: (arg: any) => boolean) {
        this.filters.push(filter);
    }

    /**
     * Removes an attached filter
     */
    dismountFilter(filter: (arg: any) => boolean) {
        fastArrayDeleteValue(this.filters, filter);
    }

    pushReciever(reciever: InputReceiver) {
        if (this.isRecieverAttached(reciever)) {
            assert(false, "Can not add reciever " + reciever.context + " twice");
            logger.error("Can not add reciever", reciever.context, "twice");
            return;
        }
        this.receiverStack.push(reciever);

        if (this.receiverStack.length > 10) {
            logger.error(
                "Reciever stack is huge, probably some dead receivers arround:",
                this.receiverStack.map(x => x.context)
            );
        }
    }

    popReciever(reciever: InputReceiver) {
        if (this.receiverStack.indexOf(reciever) < 0) {
            assert(false, "Can not pop reciever " + reciever.context + "  since its not contained");
            logger.error("Can not pop reciever", reciever.context, "since its not contained");
            return;
        }
        if (this.receiverStack[this.receiverStack.length - 1] !== reciever) {
            logger.warn(
                "Popping reciever",
                reciever.context,
                "which is not on top of the stack. Stack is: ",
                this.receiverStack.map(x => x.context)
            );
        }
        arrayDeleteValue(this.receiverStack, reciever);
    }

    isRecieverAttached(reciever: InputReceiver) {
        return this.receiverStack.indexOf(reciever) >= 0;
    }

    isRecieverOnTop(reciever: InputReceiver) {
        return (
            this.isRecieverAttached(reciever) &&
            this.receiverStack[this.receiverStack.length - 1] === reciever
        );
    }

    makeSureAttachedAndOnTop(reciever: InputReceiver) {
        this.makeSureDetached(reciever);
        this.pushReciever(reciever);
    }

    makeSureDetached(reciever: InputReceiver) {
        if (this.isRecieverAttached(reciever)) {
            arrayDeleteValue(this.receiverStack, reciever);
        }
    }

    destroyReceiver(reciever: InputReceiver) {
        this.makeSureDetached(reciever);
        reciever.cleanup();
    }

    // Internal

    getTopReciever() {
        if (this.receiverStack.length > 0) {
            return this.receiverStack[this.receiverStack.length - 1];
        }
        return null;
    }

    bindToEvents() {
        window.addEventListener("popstate", this.handleBackButton.bind(this), false);
        document.addEventListener("backbutton", this.handleBackButton.bind(this), false);

        window.addEventListener("keydown", this.handleKeyMouseDown.bind(this));
        window.addEventListener("keyup", this.handleKeyMouseUp.bind(this));

        window.addEventListener("mousedown", this.handleKeyMouseDown.bind(this));
        window.addEventListener("mouseup", this.handleKeyMouseUp.bind(this));

        window.addEventListener("blur", this.handleBlur.bind(this));

        document.addEventListener("paste", this.handlePaste.bind(this));
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

    handleBackButton(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.forwardToReceiver("backButton");
    }

    /**
     * Handles when the page got blurred
     */
    handleBlur() {
        this.forwardToReceiver("pageBlur", {});
        this.keysDown.clear();
    }

    handlePaste(ev) {
        this.forwardToReceiver("paste", ev);
    }

    handleKeyMouseDown(event: KeyboardEvent | MouseEvent) {
        const keyCode = event instanceof MouseEvent ? event.button + 1 : event.keyCode;
        if (
            keyCode === 4 || // MB4
            keyCode === 5 || // MB5
            keyCode === 9 || // TAB
            keyCode === 16 || // SHIFT
            keyCode === 17 || // CTRL
            keyCode === 18 || // ALT
            (keyCode >= 112 && keyCode < 122) // F1 - F10
        ) {
            event.preventDefault();
        }

        const isInitial = !this.keysDown.has(keyCode);
        this.keysDown.add(keyCode);

        if (
            this.forwardToReceiver("keydown", {
                keyCode: keyCode,
                shift: event.shiftKey,
                alt: event.altKey,
                ctrl: event.ctrlKey,
                initial: isInitial,
                event,
            }) === STOP_PROPAGATION
        ) {
            return;
        }

        if (keyCode === 27) {
            // Escape key
            event.preventDefault();
            event.stopPropagation();
            return this.forwardToReceiver("backButton");
        }
    }

    handleKeyMouseUp(event: KeyboardEvent | MouseEvent) {
        const keyCode = event instanceof MouseEvent ? event.button + 1 : event.keyCode;
        this.keysDown.delete(keyCode);

        this.forwardToReceiver("keyup", {
            keyCode: keyCode,
            shift: event.shiftKey,
            alt: event.altKey,
        });
    }
}
