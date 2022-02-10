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

export const BUILD_OPTIONS = {
    HAVE_ASSERT: G_HAVE_ASSERT,
    APP_ENVIRONMENT: G_APP_ENVIRONMENT,
    TRACKING_ENDPOINT: G_TRACKING_ENDPOINT,
    CHINA_VERSION: G_CHINA_VERSION,
    WEGAME_VERSION: G_WEGAME_VERSION,
    IS_DEV: G_IS_DEV,
    IS_RELEASE: G_IS_RELEASE,
    IS_MOBILE_APP: G_IS_MOBILE_APP,
    IS_BROWSER: G_IS_BROWSER,
    IS_STANDALONE: G_IS_STANDALONE,
    BUILD_TIME: G_BUILD_TIME,
    BUILD_COMMIT_HASH: G_BUILD_COMMIT_HASH,
    BUILD_VERSION: G_BUILD_VERSION,
    ALL_UI_IMAGES: G_ALL_UI_IMAGES,
};
