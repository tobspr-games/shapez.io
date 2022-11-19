import { createLogger } from "./logging";
import { fastArrayDeleteValueIfContained } from "./utils";
const logger = createLogger("request_channel");
// Thrown when a request is aborted
export const PROMISE_ABORTED = "promise-aborted";
export class RequestChannel {
    public pendingPromises: Array<Promise<any>> = [];

    watch(promise: Promise<any>): Promise<any> {
        // log(this, "Added new promise:", promise, "(pending =", this.pendingPromises.length, ")");
        let cancelled = false;
        const wrappedPromise = new Promise((resolve, reject) => {
            promise.then(
                result => {
                    // Remove from pending promises
                    fastArrayDeleteValueIfContained(this.pendingPromises, wrappedPromise);

                    // If not cancelled, resolve promise with same payload
                    if (!cancelled) {
                        resolve.call(this, result);
                    } else {
                        logger.warn("Not resolving because promise got cancelled");
                        // reject.call(this, PROMISE_ABORTED);
                    }
                },
                err => {
                    // Remove from pending promises
                    fastArrayDeleteValueIfContained(this.pendingPromises, wrappedPromise);

                    // If not cancelled, reject promise with same payload
                    if (!cancelled) {
                        reject.call(this, err);
                    } else {
                        logger.warn("Not rejecting because promise got cancelled");
                        // reject.call(this, PROMISE_ABORTED);
                    }
                }
            );
        });

        // Add cancel handler
        // @ts-ignore
        wrappedPromise.cancel = function () {
            cancelled = true;
        };
        this.pendingPromises.push(wrappedPromise);
        return wrappedPromise;
    }

    cancelAll() {
        if (this.pendingPromises.length > 0) {
            logger.log("Cancel all pending promises (", this.pendingPromises.length, ")");
        }
        for (let i = 0; i < this.pendingPromises.length; ++i) {
            // @ts-ignore
            this.pendingPromises[i].cancel();
        }
        this.pendingPromises = [];
    }
}
