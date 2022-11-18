export const STOP_PROPAGATION: any = "stop_propagation";
export class Signal {
    public receivers = [];
    public modifyCount = 0;

    constructor() {
    }
    /**
     * Adds a new signal listener
     */
    add(receiver: function, scope: object = null): any {
        assert(receiver, "receiver is null");
        this.receivers.push({ receiver, scope });
        ++this.modifyCount;
    }
    /**
     * Adds a new signal listener
     */
    addToTop(receiver: function, scope: object = null): any {
        assert(receiver, "receiver is null");
        this.receivers.unshift({ receiver, scope });
        ++this.modifyCount;
    }
    /**
     * Dispatches the signal
     * @param  {} payload
     */
    dispatch(): any {
        const modifyState: any = this.modifyCount;
        const n: any = this.receivers.length;
        for (let i: any = 0; i < n; ++i) {
            const { receiver, scope }: any = this.receivers[i];
            if (receiver.apply(scope, arguments) === STOP_PROPAGATION) {
                return STOP_PROPAGATION;
            }
            if (modifyState !== this.modifyCount) {
                // Signal got modified during iteration
                return STOP_PROPAGATION;
            }
        }
    }
    /**
     * Removes a receiver
     */
    remove(receiver: function): any {
        let index: any = null;
        const n: any = this.receivers.length;
        for (let i: any = 0; i < n; ++i) {
            if (this.receivers[i].receiver === receiver) {
                index = i;
                break;
            }
        }
        assert(index !== null, "Receiver not found in list");
        this.receivers.splice(index, 1);
        ++this.modifyCount;
    }
    /**
     * Removes all receivers
     */
    removeAll(): any {
        this.receivers = [];
        ++this.modifyCount;
    }
}
