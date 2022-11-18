import { createLogger } from "./logging";
const logger = createLogger("assert");
let assertionErrorShown = false;
function initAssert() {
    /**
     * Expects a given condition to be true
     * @param  {} failureMessage
     */
    // @ts-ignore
    window.assert = function (condition: Boolean, ...failureMessage: ...String) {
        if (!condition) {
            logger.error("assertion failed:", ...failureMessage);
            if (!assertionErrorShown) {
                // alert("Assertion failed (the game will try to continue to run): \n\n" + failureMessage);
                assertionErrorShown = true;
            }
            throw new Error("AssertionError: " + failureMessage.join(" "));
        }
    };
}
initAssert();
