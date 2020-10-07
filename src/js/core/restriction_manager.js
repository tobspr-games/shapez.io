import { Application } from "../application";
import { ExplainedResult } from "./explained_result";
import { queryParamOptions } from "./query_parameters";
import { ReadWriteProxy } from "./read_write_proxy";

export class RestrictionManager extends ReadWriteProxy {
    /**
     * @param {Application} app
     */
    constructor(app) {
        super(app, "restriction-flags.bin");
    }

    // -- RW Proxy Impl

    /**
     * @param {any} data
     */
    verify(data) {
        return ExplainedResult.good();
    }

    /**
     */
    getDefaultData() {
        return {
            savegameV1119Imported: false,
        };
    }

    /**
     */
    getCurrentVersion() {
        return 1;
    }

    /**
     * @param {any} data
     */
    migrate(data) {
        // Todo
        return ExplainedResult.good();
    }

    // -- End RW Proxy Impl

    /**
     * Returns if the app is currently running as the limited version
     * @returns {boolean}
     */
    isLimitedVersion() {
        return queryParamOptions.fullVersion
            ? false
            : (!G_IS_DEV && !G_IS_STANDALONE) ||
                  (typeof window !== "undefined" && window.location.search.indexOf("demo") >= 0);
    }

    /**
     * Returns if the app markets the standalone version on steam
     * @returns {boolean}
     */
    getIsStandaloneMarketingActive() {
        return this.isLimitedVersion();
    }

    /**
     * Returns if exporting the base as a screenshot is possible
     * @returns {boolean}
     */
    getIsExportingScreenshotsPossible() {
        return !this.isLimitedVersion();
    }

    /**
     * Returns the maximum number of supported waypoints
     * @returns {number}
     */
    getMaximumWaypoints() {
        return this.isLimitedVersion() ? 2 : 1e20;
    }

    /**
     * Returns if the user has unlimited savegames
     * @returns {boolean}
     */
    getHasUnlimitedSavegames() {
        return !this.isLimitedVersion();
    }

    /**
     * Returns if the app has all settings available
     * @returns {boolean}
     */
    getHasExtendedSettings() {
        return !this.isLimitedVersion();
    }
}
