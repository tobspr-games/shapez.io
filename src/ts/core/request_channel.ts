import { createLogger } from "./logging";
import { fastArrayDeleteValueIfContained } from "./utils";
const logger: any = createLogger("request_channel");
// Thrown when a request is aborted
export const PROMISE_ABORTED: any = "promise-aborted";
export class RequestChannel {
    public pendingPromises: Array<Promise> = [];

    constructor() {
    }
    /**
     *
     * {}
     */
    watch(promise: Promise<any>): Promise<any> {
        // log(this, "Added new promise:", promise, "(pending =", this.pendingPromises.length, ")");
        let cancelled: any = false;
        const wrappedPromise: any = new Promise((resolve: any, reject: any): any => {
            promise.then((result: any): any => {
                // Remove from pending promises
                fastArrayDeleteValueIfContained(this.pendingPromises, wrappedPromise);
                // If not cancelled, resolve promise with same payload
                if (!cancelled) {
                    resolve.call(this, result);
                }
                else {
                    logger.warn("Not resolving because promise got cancelled");
                    // reject.call(this, PROMISE_ABORTED);
                }
            }, (err: any): any => {
                // Remove from pending promises
                fastArrayDeleteValueIfContained(this.pendingPromises, wrappedPromise);
                // If not cancelled, reject promise with same payload
                if (!cancelled) {
                    reject.call(this, err);
                }
                else {
                    logger.warn("Not rejecting because promise got cancelled");
                    // reject.call(this, PROMISE_ABORTED);
                }
            });
        });
        // Add cancel handler
        // @ts-ignore
        wrappedPromise.cancel = function (): any {
            cancelled = true;
        };
        this.pendingPromises.push(wrappedPromise);
        return wrappedPromise;
    }
    cancelAll(): any {
        if (this.pendingPromises.length > 0) {
            logger.log("Cancel all pending promises (", this.pendingPromises.length, ")");
        }
        for (let i: any = 0; i < this.pendingPromises.length; ++i) {
            // @ts-ignore
            this.pendingPromises[i].cancel();
        }
        this.pendingPromises = [];
    }
}
