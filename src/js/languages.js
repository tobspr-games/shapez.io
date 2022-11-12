/**
 * @type {Object<string, {name: string, data: any, code: string, region: string}>}
 */
export const LANGUAGES = {
    "en": {
        name: "English",
        data: null,
        code: "en",
        region: "",
    },

    "zh-CN": {
        // simplified chinese
        name: "简体中文",
        data: require("./built-temp/base-zh-CN.json"),
        code: "zh",
        region: "CN",
    },

    "zh-TW": {
        // traditional chinese
        name: "繁體中文",
        data: require("./built-temp/base-zh-TW.json"),
        code: "zh",
        region: "TW",
    },

    "ja": {
        // japanese
        name: "日本語",
        data: require("./built-temp/base-ja.json"),
        code: "ja",
        region: "",
    },

    "kor": {
        // korean
        name: "한국어",
        data: require("./built-temp/base-kor.json"),
        code: "ko",
        region: "",
    },

    "cs": {
        // czech
        name: "Čeština",
        data: require("./built-temp/base-cz.json"),
        code: "cs",
        region: "",
    },

    "da": {
        // danish
        name: "Dansk",
        data: require("./built-temp/base-da.json"),
        code: "da",
        region: "",
    },

    "de": {
        // german
        name: "Deutsch",
        data: require("./built-temp/base-de.json"),
        code: "de",
        region: "",
    },

    "es-419": {
        // spanish
        name: "Español",
        data: require("./built-temp/base-es.json"),
        code: "es",
        region: "",
    },

    "fr": {
        // french
        name: "Français",
        data: require("./built-temp/base-fr.json"),
        code: "fr",
        region: "",
    },

    "it": {
        // italian
        name: "Italiano",
        data: require("./built-temp/base-it.json"),
        code: "it",
        region: "",
    },

    "hu": {
        // hungarian
        name: "Magyar",
        data: require("./built-temp/base-hu.json"),
        code: "hu",
        region: "",
    },

    "nl": {
        // dutch
        name: "Nederlands",
        data: require("./built-temp/base-nl.json"),
        code: "nl",
        region: "",
    },

    "no": {
        // norwegian
        name: "Norsk",
        data: require("./built-temp/base-no.json"),
        code: "no",
        region: "",
    },

    "pl": {
        // polish
        name: "Polski",
        data: require("./built-temp/base-pl.json"),
        code: "pl",
        region: "",
    },

    "pt-PT": {
        // portuguese
        name: "Português",
        data: require("./built-temp/base-pt-PT.json"),
        code: "pt",
        region: "PT",
    },

    "pt-BR": {
        // portuguese - brazil
        name: "Português - Brasil",
        data: require("./built-temp/base-pt-BR.json"),
        code: "pt",
        region: "BR",
    },

    "ro": {
        // romanian
        name: "Română",
        data: require("./built-temp/base-ro.json"),
        code: "ro",
        region: "",
    },

    "ru": {
        // russian
        name: "Русский",
        data: require("./built-temp/base-ru.json"),
        code: "ru",
        region: "",
    },

    "fi": {
        // finish
        name: "Suomi",
        data: require("./built-temp/base-fi.json"),
        code: "fi",
        region: "",
    },

    "sv": {
        // swedish
        name: "Svenska",
        data: require("./built-temp/base-sv.json"),
        code: "sv",
        region: "",
    },

    "tr": {
        // turkish
        name: "Türkçe",
        data: require("./built-temp/base-tr.json"),
        code: "tr",
        region: "",
    },

    "uk": {
        // ukrainian
        name: "Українська",
        data: require("./built-temp/base-uk.json"),
        code: "uk",
        region: "",
    },

    "he": {
        // hebrew
        name: "עברית",
        data: require("./built-temp/base-he.json"),
        code: "he",
        region: "",
    },
};
