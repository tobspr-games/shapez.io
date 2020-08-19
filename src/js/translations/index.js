import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import languageMap, { isLanguageTag, languageTags } from "./languages";

/**
 * @typedef {import("./languages").LanguageTag} LanguageTag
 **/

const logger = createLogger("translations");

export const T = languageMap.en.data;

if (G_IS_DEV && globalConfig.debug.testTranslations) {
    // Replaces all translations by fake translations to see whats translated and what not
    const mapTranslations = obj => {
        for (const key in obj) {
            const value = obj[key];
            if (typeof value === "string") {
                obj[key] = value.replace(/[a-z]/gi, "x");
            } else {
                mapTranslations(value);
            }
        }
    };
    mapTranslations(T);
}

/** tag should be a language code, like de-DE or en or en-US
 * @param {string} tag
 * @returns {LanguageTag | null}
 **/
function mapLanguageCodeToId(tag) {
    if (isLanguageTag(tag)) {
        return tag;
    }

    const [code] = tag.split("-");

    // Try to match by tag or code
    for (const languageTag of languageTags) {
        const { code: c } = languageMap[languageTag];
        if (tag === c) {
            console.log("-> Match", tag, "->", languageTag);
            return languageTag;
        }
        if (code === c) {
            console.log("-> Match by short key", tag, "->", languageTag);
            return languageTag;
        }
    }

    return null;
}

/**
 * Tries to auto-detect a language
 * @returns {LanguageTag}
 */
export function autoDetectLanguageId() {
    let languages = [];
    if (navigator.languages) {
        languages = navigator.languages.slice();
    } else if (navigator.language) {
        languages = [navigator.language];
    } else {
        logger.warn("Navigator has no languages prop");
    }

    for (let i = 0; i < languages.length; ++i) {
        logger.log("Trying to find language target for", languages[i]);
        const trans = mapLanguageCodeToId(languages[i]);
        if (trans) {
            return trans;
        }
    }

    // Fallback
    return "en";
}

function matchDataRecursive(dest, src) {
    if (typeof dest !== "object" || typeof src !== "object") {
        return;
    }

    for (const key in dest) {
        if (src[key]) {
            const data = dest[key];
            if (typeof data === "object") {
                matchDataRecursive(dest[key], src[key]);
            } else if (typeof data === "string" || typeof data === "number") {
                dest[key] = src[key];
            } else {
                logger.log("Unknown type:", typeof data, "in key", key);
            }
        }
    }
}

/**
 * @param {LanguageTag} languageTag
 **/
export function updateApplicationLanguage(languageTag) {
    logger.log("Setting application language:", languageTag);

    if (!languageMap.hasOwnProperty(languageTag)) {
        logger.error("Unknown language:", languageTag);
        return;
    }

    const { data } = languageMap[languageTag];

    logger.log("Applying translations ...");
    matchDataRecursive(T, data);
}
