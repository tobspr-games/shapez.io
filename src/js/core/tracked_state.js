export class TrackedState {
    constructor(callbackMethod = null, callbackScope = null) {
        this.lastSeenValue = null;

        if (callbackMethod) {
            this.callback = callbackMethod;
            if (callbackScope) {
                this.callback = this.callback.bind(callbackScope);
            }
        }
    }

    set(value, changeHandler = null, changeScope = null) {
        if (value !== this.lastSeenValue) {
            // Copy value since the changeHandler call could actually modify our lastSeenValue
            const valueCopy = value;
            this.lastSeenValue = value;
            if (changeHandler) {
                if (changeScope) {
                    changeHandler.call(changeScope, valueCopy);
                } else {
                    changeHandler(valueCopy);
                }
            } else if (this.callback) {
                this.callback(value);
            } else {
                assert(false, "No callback specified");
            }
        }
    }

    setSilent(value) {
        this.lastSeenValue = value;
    }

    get() {
        return this.lastSeenValue;
    }
}
