import { Signal } from "./signal";
export class InputReceiver {
    public context = context;
    public backButton = new Signal();
    public keydown = new Signal();
    public keyup = new Signal();
    public pageBlur = new Signal();
    public destroyed = new Signal();
    public paste = new Signal();

    constructor(context = "unknown") {
    }
    cleanup() {
        this.backButton.removeAll();
        this.keydown.removeAll();
        this.keyup.removeAll();
        this.paste.removeAll();
        this.destroyed.dispatch();
    }
}
