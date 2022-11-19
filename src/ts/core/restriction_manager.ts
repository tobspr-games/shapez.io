/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
import { ExplainedResult } from "./explained_result";
import { ReadWriteProxy } from "./read_write_proxy";
import { WEB_STEAM_SSO_AUTHENTICATED } from "./steam_sso";
export class RestrictionManager extends ReadWriteProxy {
    public currentData = this.getDefaultData();

    constructor(app) {
        super(app, "restriction-flags.bin");
    }
    // -- RW Proxy Impl
    verify(data: any) {
        return ExplainedResult.good();
    }

    getDefaultData() {
        return {
            version: this.getCurrentVersion(),
        };
    }

    getCurrentVersion() {
        return 1;
    }
    migrate(data: any) {
        return ExplainedResult.good();
    }
    initialize() {
        return this.readAsync();
    }
    // -- End RW Proxy Impl
    /**
     * Returns if the app is currently running as the limited version
     * {}
     */
    isLimitedVersion(): boolean {
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
     * {}
     */
    getIsStandaloneMarketingActive(): boolean {
        return this.isLimitedVersion();
    }
    /**
     * Returns if exporting the base as a screenshot is possible
     * {}
     */
    getIsExportingScreenshotsPossible(): boolean {
        return !this.isLimitedVersion();
    }
    /**
     * Returns the maximum number of supported waypoints
     * {}
     */
    getMaximumWaypoints(): number {
        return this.isLimitedVersion() ? 2 : 1e20;
    }
    /**
     * Returns if the user has unlimited savegames
     * {}
     */
    getHasUnlimitedSavegames(): boolean {
        return !this.isLimitedVersion();
    }
    /**
     * Returns if the app has all settings available
     * {}
     */
    getHasExtendedSettings(): boolean {
        return !this.isLimitedVersion();
    }
    /**
     * Returns if all upgrades are available
     * {}
     */
    getHasExtendedUpgrades(): boolean {
        return !this.isLimitedVersion();
    }
    /**
     * Returns if all levels & freeplay is available
     * {}
     */
    getHasExtendedLevelsAndFreeplay(): boolean {
        return !this.isLimitedVersion();
    }
}
