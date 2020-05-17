import { globalConfig } from "./core/config";

const baseTranslations = require("./translations-built/base-en.json");

export const T = baseTranslations;

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
