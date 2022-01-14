/* typehints:start */
import { Application } from "../application";
/* typehints:end */

/**
 * Used for the bug reporter, and the click detector which both have no handles to this.
 * It would be nicer to have no globals, but this is the only one. I promise!
 * @type {Application} */
export let GLOBAL_APP = null;

/**
 * @param {Application} app
 */
export function setGlobalApp(app) {
    assert(!GLOBAL_APP, "Create application twice!");
    GLOBAL_APP = app;
}
