/* typehints:start */
import { Application } from "../application";
/* typehints:end */
import { ExplainedResult } from "./explained_result";
import { ReadWriteProxy } from "./read_write_proxy";
import { WEB_STEAM_SSO_AUTHENTICATED } from "./steam_sso";

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
        return this.readAsync();
    }

    // -- End RW Proxy Impl

    /**
     * Returns if the app is currently running as the limited version
     * @returns {boolean}
     */
    isLimitedVersion() {
        if (G_IS_STANDALONE) {
            // Standalone is never limited
            return false;
        }

        if (WEB_STEAM_SSO_AUTHENTICATED) {
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
        return !this.isLimitedVersion();
    }

    /**
     * Returns if all levels & freeplay is available
     * @returns {boolean}
     */
    getHasExtendedLevelsAndFreeplay() {
        return !this.isLimitedVersion();
    }
}
