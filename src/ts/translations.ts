import { globalConfig } from "./core/config";
import { createLogger } from "./core/logging";
import { LANGUAGES } from "./languages";
const logger: any = createLogger("translations");
// @ts-ignore
const baseTranslations: any = require("./built-temp/base-en.json");
export let T: any = baseTranslations;
if (G_IS_DEV && globalConfig.debug.testTranslations) {
    // Replaces all translations by fake translations to see whats translated and what not
    const mapTranslations: any = (obj: any): any => {
        for (const key: any in obj) {
            const value: any = obj[key];
            if (typeof value === "string") {
                obj[key] = value.replace(/[a-z]/gi, "x");
            }
            else {
                mapTranslations(value);
            }
        }
    };
    mapTranslations(T);
}
// Language key is something like de-DE or en or en-US
function mapLanguageCodeToId(languageKey: any): any {
    const key: any = languageKey.toLowerCase();
    const shortKey: any = key.split("-")[0];
    // Try to match by key or short key
    for (const id: any in LANGUAGES) {
        const data: any = LANGUAGES[id];
        const code: any = data.code.toLowerCase();
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
    for (const id: any in LANGUAGES) {
        const data: any = LANGUAGES[id];
        const code: any = data.code.toLowerCase();
        const shortCode: any = code.split("-")[0];
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
 * {}
 */
export function autoDetectLanguageId(): string {
    let languages: any = [];
    if (navigator.languages) {
        languages = navigator.languages.slice();
    }
    else if (navigator.language) {
        languages = [navigator.language];
    }
    else {
        logger.warn("Navigator has no languages prop");
    }
    for (let i: any = 0; i < languages.length; ++i) {
        logger.log("Trying to find language target for", languages[i]);
        const trans: any = mapLanguageCodeToId(languages[i]);
        if (trans) {
            return trans;
        }
    }
    // Fallback
    return "en";
}
export function matchDataRecursive(dest: any, src: any, addNewKeys: any = false): any {
    if (typeof dest !== "object" || typeof src !== "object") {
        return;
    }
    if (dest === null || src === null) {
        return;
    }
    for (const key: any in dest) {
        if (src[key]) {
            // console.log("copy", key);
            const data: any = dest[key];
            if (typeof data === "object") {
                matchDataRecursive(dest[key], src[key], addNewKeys);
            }
            else if (typeof data === "string" || typeof data === "number") {
                // console.log("match string", key);
                dest[key] = src[key];
            }
            else {
                logger.log("Unknown type:", typeof data, "in key", key);
            }
        }
    }
    if (addNewKeys) {
        for (const key: any in src) {
            if (!dest[key]) {
                dest[key] = JSON.parse(JSON.stringify(src[key]));
            }
        }
    }
}
export function updateApplicationLanguage(id: any): any {
    logger.log("Setting application language:", id);
    const data: any = LANGUAGES[id];
    if (!data) {
        logger.error("Unknown language:", id);
        return;
    }
    if (data.data) {
        logger.log("Applying translations ...");
        matchDataRecursive(T, data.data);
    }
}
