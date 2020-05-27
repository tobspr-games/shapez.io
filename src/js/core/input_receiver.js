import { Signal } from "./signal";

export class InputReceiver {
    constructor(context = "unknown") {
        this.context = context;

        this.backButton = new Signal();

        this.keydown = new Signal();
        this.keyup = new Signal();
        this.pageBlur = new Signal();

        // Dispatched on destroy
        this.destroyed = new Signal();
    }

    cleanup() {
        this.backButton.removeAll();
        this.keydown.removeAll();
        this.keyup.removeAll();

        this.destroyed.dispatch();
    }
}
