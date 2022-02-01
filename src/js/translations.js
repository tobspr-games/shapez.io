import { globalConfig } from "./core/config";
import { createLogger } from "./core/logging";
import { LANGUAGES } from "./languages";

const logger = createLogger("translations");

// @ts-ignore
const baseTranslations = require("./built-temp/base-en.json");

export let T = baseTranslations;

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

// Language key is something like de-DE or en or en-US
function mapLanguageCodeToId(languageKey) {
    const key = languageKey.toLowerCase();
    const shortKey = key.split("-")[0];

    // Try to match by key or short key
    for (const id in LANGUAGES) {
        const data = LANGUAGES[id];
        const code = data.code.toLowerCase();
        if (code === key) {
            console.log("-> Match", languageKey, "->", id);
            return id;
        }
        if (code === shortKey) {
            console.log("-> Match by short key", languageKey, "->", id);
            return id;
        }
    }

    // If none found, try to find a better alternative by using the base language at least
    for (const id in LANGUAGES) {
        const data = LANGUAGES[id];
        const code = data.code.toLowerCase();
        const shortCode = code.split("-")[0];

        if (shortCode === key) {
            console.log("-> Desperate Match", languageKey, "->", id);
            return id;
        }
        if (shortCode === shortKey) {
            console.log("-> Desperate Match by short key", languageKey, "->", id);
            return id;
        }
    }

    return null;
}

/**
 * Tries to auto-detect a language
 * @returns {string}
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

export function matchDataRecursive(dest, src, addNewKeys = false) {
    if (typeof dest !== "object" || typeof src !== "object") {
        return;
    }
    if (dest === null || src === null) {
        return;
    }

    for (const key in dest) {
        if (src[key]) {
            // console.log("copy", key);
            const data = dest[key];
            if (typeof data === "object") {
                matchDataRecursive(dest[key], src[key], addNewKeys);
            } else if (typeof data === "string" || typeof data === "number") {
                // console.log("match string", key);
                dest[key] = src[key];
            } else {
                logger.log("Unknown type:", typeof data, "in key", key);
            }
        }
    }

    if (addNewKeys) {
        for (const key in src) {
            if (!dest[key]) {
                dest[key] = JSON.parse(JSON.stringify(src[key]));
            }
        }
    }
}

export function updateApplicationLanguage(id) {
    logger.log("Setting application language:", id);

    const data = LANGUAGES[id];

    if (!data) {
        logger.error("Unknown language:", id);
        return;
    }

    if (data.data) {
        logger.log("Applying translations ...");
        matchDataRecursive(T, data.data);
    }
}
