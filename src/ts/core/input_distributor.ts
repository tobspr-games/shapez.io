/* typehints:start */
import type { Application } from "../application";
import type { InputReceiver } from "./input_receiver";
/* typehints:end */
import { Signal, STOP_PROPAGATION } from "./signal";
import { createLogger } from "./logging";
import { arrayDeleteValue, fastArrayDeleteValue } from "./utils";
const logger: any = createLogger("input_distributor");
export class InputDistributor {
    public app = app;
    public recieverStack: Array<InputReceiver> = [];
    public filters: Array<function(: boolean):boolean> = [];
    public keysDown = new Set();

        constructor(app) {
        this.bindToEvents();
    }
    /**
     * Attaches a new filter which can filter and reject events
     */
    installFilter(filter: function(: boolean):boolean): any {
        this.filters.push(filter);
    }
    /**
     * Removes an attached filter
     */
    dismountFilter(filter: function(: boolean):boolean): any {
        fastArrayDeleteValue(this.filters, filter);
    }
        pushReciever(reciever: InputReceiver): any {
        if (this.isRecieverAttached(reciever)) {
            assert(false, "Can not add reciever " + reciever.context + " twice");
            logger.error("Can not add reciever", reciever.context, "twice");
            return;
        }
        this.recieverStack.push(reciever);
        if (this.recieverStack.length > 10) {
            logger.error("Reciever stack is huge, probably some dead receivers arround:", this.recieverStack.map((x: any): any => x.context));
        }
    }
        popReciever(reciever: InputReceiver): any {
        if (this.recieverStack.indexOf(reciever) < 0) {
            assert(false, "Can not pop reciever " + reciever.context + "  since its not contained");
            logger.error("Can not pop reciever", reciever.context, "since its not contained");
            return;
        }
        if (this.recieverStack[this.recieverStack.length - 1] !== reciever) {
            logger.warn("Popping reciever", reciever.context, "which is not on top of the stack. Stack is: ", this.recieverStack.map((x: any): any => x.context));
        }
        arrayDeleteValue(this.recieverStack, reciever);
    }
        isRecieverAttached(reciever: InputReceiver): any {
        return this.recieverStack.indexOf(reciever) >= 0;
    }
        isRecieverOnTop(reciever: InputReceiver): any {
        return (this.isRecieverAttached(reciever) &&
            this.recieverStack[this.recieverStack.length - 1] === reciever);
    }
        makeSureAttachedAndOnTop(reciever: InputReceiver): any {
        this.makeSureDetached(reciever);
        this.pushReciever(reciever);
    }
        makeSureDetached(reciever: InputReceiver): any {
        if (this.isRecieverAttached(reciever)) {
            arrayDeleteValue(this.recieverStack, reciever);
        }
    }
        destroyReceiver(reciever: InputReceiver): any {
        this.makeSureDetached(reciever);
        reciever.cleanup();
    }
    // Internal
    getTopReciever(): any {
        if (this.recieverStack.length > 0) {
            return this.recieverStack[this.recieverStack.length - 1];
        }
        return null;
    }
    bindToEvents(): any {
        window.addEventListener("popstate", this.handleBackButton.bind(this), false);
        document.addEventListener("backbutton", this.handleBackButton.bind(this), false);
        window.addEventListener("keydown", this.handleKeyMouseDown.bind(this));
        window.addEventListener("keyup", this.handleKeyMouseUp.bind(this));
        window.addEventListener("mousedown", this.handleKeyMouseDown.bind(this));
        window.addEventListener("mouseup", this.handleKeyMouseUp.bind(this));
        window.addEventListener("blur", this.handleBlur.bind(this));
        document.addEventListener("paste", this.handlePaste.bind(this));
    }
    forwardToReceiver(eventId: any, payload: any = null): any {
        // Check filters
        for (let i: any = 0; i < this.filters.length; ++i) {
            if (!this.filters[i](eventId)) {
                return STOP_PROPAGATION;
            }
        }
        const reciever: any = this.getTopReciever();
        if (!reciever) {
            logger.warn("Dismissing event because not reciever was found:", eventId);
            return;
        }
        const signal: any = reciever[eventId];
        assert(signal instanceof Signal, "Not a valid event id");
        return signal.dispatch(payload);
    }
        handleBackButton(event: Event): any {
        event.preventDefault();
        event.stopPropagation();
        this.forwardToReceiver("backButton");
    }
    /**
     * Handles when the page got blurred
     */
    handleBlur(): any {
        this.forwardToReceiver("pageBlur", {});
        this.keysDown.clear();
    }
    
    handlePaste(ev: any): any {
        this.forwardToReceiver("paste", ev);
    }
        handleKeyMouseDown(event: KeyboardEvent | MouseEvent): any {
        const keyCode: any = event instanceof MouseEvent ? event.button + 1 : event.keyCode;
        if (keyCode === 4 || // MB4
            keyCode === 5 || // MB5
            keyCode === 9 || // TAB
            keyCode === 16 || // SHIFT
            keyCode === 17 || // CTRL
            keyCode === 18 || // ALT
            (keyCode >= 112 && keyCode < 122) // F1 - F10
        ) {
            event.preventDefault();
        }
        const isInitial: any = !this.keysDown.has(keyCode);
        this.keysDown.add(keyCode);
        if (this.forwardToReceiver("keydown", {
            keyCode: keyCode,
            shift: event.shiftKey,
            alt: event.altKey,
            ctrl: event.ctrlKey,
            initial: isInitial,
            event,
        }) === STOP_PROPAGATION) {
            return;
        }
        if (keyCode === 27) {
            // Escape key
            event.preventDefault();
            event.stopPropagation();
            return this.forwardToReceiver("backButton");
        }
    }
        handleKeyMouseUp(event: KeyboardEvent | MouseEvent): any {
        const keyCode: any = event instanceof MouseEvent ? event.button + 1 : event.keyCode;
        this.keysDown.delete(keyCode);
        this.forwardToReceiver("keyup", {
            keyCode: keyCode,
            shift: event.shiftKey,
            alt: event.altKey,
        });
    }
}
