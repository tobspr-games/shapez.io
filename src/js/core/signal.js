export const STOP_PROPAGATION = "stop_propagation";

export class Signal {
    constructor() {
        this.receivers = [];
        this.modifyCount = 0;
    }

    /**
     * Adds a new signal listener
     * @param {function} receiver
     * @param {object} scope
     */
    add(receiver, scope = null) {
        assert(receiver, "receiver is null");
        this.receivers.push({ receiver, scope });
        ++this.modifyCount;
    }

    /**
     * Dispatches the signal
     * @param  {...any} payload
     */
    dispatch() {
        const modifyState = this.modifyCount;

        const n = this.receivers.length;
        for (let i = 0; i < n; ++i) {
            const { receiver, scope } = this.receivers[i];
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
     * @param {function} receiver
     */
    remove(receiver) {
        let index = null;
        const n = this.receivers.length;
        for (let i = 0; i < n; ++i) {
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
    removeAll() {
        this.receivers = [];
        ++this.modifyCount;
    }
}
