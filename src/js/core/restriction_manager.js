/* typehints:start */
import { Application } from "../application";
/* typehints:end */
import { ExplainedResult } from "./explained_result";
import { queryParamOptions } from "./query_parameters";
import { ReadWriteProxy } from "./read_write_proxy";

export class RestrictionManager extends ReadWriteProxy {
    /**
     * @param {Application} app
     */
    constructor(app) {
        super(app, "restriction-flags.bin");

        this.currentData = this.getDefaultData();
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
            version: this.getCurrentVersion(),
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
        return ExplainedResult.good();
    }

    initialize() {
        return this.readAsync().then(() => {
            if (this.currentData.savegameV1119Imported) {
                console.warn("Levelunlock is granted to current user due to past savegame");
            }
        });
    }

    // -- End RW Proxy Impl

    /**
     * Checks if there are any savegames from the 1.1.19 version
     */
    onHasLegacySavegamesChanged(has119Savegames = false) {
        if (has119Savegames && !this.currentData.savegameV1119Imported) {
            this.currentData.savegameV1119Imported = true;
            console.warn("Current user now has access to all levels due to 1119 savegame");
            return this.writeAsync();
        }
        return Promise.resolve();
    }

    /**
     * Returns if the app is currently running as the limited version
     * @returns {boolean}
     */
    isLimitedVersion() {
        if (G_IS_STANDALONE) {
            // Standalone is never limited
            return false;
        }

        if (queryParamOptions.embedProvider === "gamedistribution") {
            // also full version on gamedistribution
            return false;
        }

        if (G_IS_DEV) {
            return typeof window !== "undefined" && window.location.search.indexOf("demo") >= 0;
        }

        return true;
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

    /**
     * Returns if all upgrades are available
     * @returns {boolean}
     */
    getHasExtendedUpgrades() {
        return !this.isLimitedVersion() || this.currentData.savegameV1119Imported;
    }

    /**
     * Returns if all levels & freeplay is available
     * @returns {boolean}
     */
    getHasExtendedLevelsAndFreeplay() {
        return !this.isLimitedVersion() || this.currentData.savegameV1119Imported;
    }
}
