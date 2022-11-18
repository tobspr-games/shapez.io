export class TrackedState {
    public lastSeenValue = null;

    constructor(callbackMethod = null, callbackScope = null) {
        if (callbackMethod) {
            this.callback = callbackMethod;
            if (callbackScope) {
                this.callback = this.callback.bind(callbackScope);
            }
        }
    }
    set(value: any, changeHandler: any = null, changeScope: any = null): any {
        if (value !== this.lastSeenValue) {
            // Copy value since the changeHandler call could actually modify our lastSeenValue
            const valueCopy: any = value;
            this.lastSeenValue = value;
            if (changeHandler) {
                if (changeScope) {
                    changeHandler.call(changeScope, valueCopy);
                }
                else {
                    changeHandler(valueCopy);
                }
            }
            else if (this.callback) {
                this.callback(value);
            }
            else {
                assert(false, "No callback specified");
            }
        }
    }
    setSilent(value: any): any {
        this.lastSeenValue = value;
    }
    get(): any {
        return this.lastSeenValue;
    }
}
