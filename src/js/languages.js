/**
 * @type {Object<string, {name: string, data: any, code: string, region: string}>}
 */
export const LANGUAGES = {
    en: {
        name: "English",
        data: null,
        code: "en",
        region: "",
    },
    de: {
        name: "Deutsch",
        data: require("./built-temp/base-de.json"),
        code: "de",
        region: "",
    },
    fr: {
        name: "Français",
        data: require("./built-temp/base-fr.json"),
        code: "fr",
        region: "",
    },
};
