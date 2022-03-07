/* typehints:start */
import { Application } from "../application";
/* typehints:end */
import { IS_MAC } from "./config";
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
            return this.writeAsync();
        }
        return Promise.resolve();
    }

    /**
     * Returns if the app is currently running as the limited version
     * @returns {boolean}
     */
    isLimitedVersion() {
        return true;
    }

    /**
     * Returns if the app markets the standalone version on steam
     * @returns {boolean}
     */
    getIsStandaloneMarketingActive() {
        return true;
    }

    /**
     * Returns if exporting the base as a screenshot is possible
     * @returns {boolean}
     */
    getIsExportingScreenshotsPossible() {
        return false;
    }

    /**
     * Returns the maximum number of supported waypoints
     * @returns {number}
     */
    getMaximumWaypoints() {
        return 2;
    }

    /**
     * Returns if the user has unlimited savegames
     * @returns {boolean}
     */
    getHasUnlimitedSavegames() {
        return false;
    }

    /**
     * Returns if the app has all settings available
     * @returns {boolean}
     */
    getHasExtendedSettings() {
        return false;
    }

    /**
     * Returns if all upgrades are available
     * @returns {boolean}
     */
    getHasExtendedUpgrades() {
        return false;
    }

    /**
     * Returns if all levels & freeplay is available
     * @returns {boolean}
     */
    getHasExtendedLevelsAndFreeplay() {
        return false;
    }
}
