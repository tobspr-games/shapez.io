import { AdProviderInterface } from "../ad_provider";

/**
 * Stores information about where we are iframed
 */
export class EmbedProvider {
    /**
     * @returns {string}
     */
    getId() {
        abstract;
        return "";
    }

    /**
     * Whether this provider supports ads
     * @returns {boolean}
     */
    getSupportsAds() {
        return false;
    }

    /**
     * Returns the ad provider
     * @returns {typeof AdProviderInterface}
     */
    getAdProvider() {
        abstract;
        return null;
    }

    /**
     * Whetherexternal links are supported
     * @returns {boolean}
     */
    getSupportsExternalLinks() {
        return true;
    }

    /**
     * Returns whether this provider is iframed
     * @returns {boolean}
     */
    getIsIframed() {
        return true;
    }
}
