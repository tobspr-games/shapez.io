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
    "de": {
        name: "Deutsch",
        data: require("./built-temp/base-de.json"),
        code: "de",
        region: "",
    },
    "fr": {
        name: "Français",
        data: require("./built-temp/base-fr.json"),
        code: "fr",
        region: "",
    },
    "ja": {
        name: "日本語",
        data: require("./built-temp/base-ja.json"),
        code: "ja",
        region: "",
    },
    "pt-PT": {
        name: "Português (Portugal)",
        data: require("./built-temp/base-pt-PT.json"),
        code: "pt",
        region: "PT",
    },
    "pt-BR": {
        name: "Português (Brasil)",
        data: require("./built-temp/base-pt-BR.json"),
        code: "pt",
        region: "BR",
    },
    "ru": {
        name: "Русский",
        data: require("./built-temp/base-ru.json"),
        code: "ru",
        region: "",
    },
    "cs": {
        name: "Čeština",
        data: require("./built-temp/base-cz.json"),
        code: "cs",
        region: "",
    },
    "es-419": {
        name: "Español (Latinoamérica)",
        data: require("./built-temp/base-es.json"),
        code: "es",
        region: "419",
    },
    "pl": {
        name: "Polski",
        data: require("./built-temp/base-pl.json"),
        code: "pl",
        region: "",
    },
    "kor": {
        name: "한국어",
        data: require("./built-temp/base-kor.json"),
        code: "kor",
        region: "",
    },
    "nl": {
        name: "Nederlands",
        data: require("./built-temp/base-nl.json"),
        code: "nl",
        region: "",
    },
    "no": {
        name: "Norsk",
        data: require("./built-temp/base-no.json"),
        code: "no",
        region: "",
    },
    "zh-CN": {
        name: "简体中文",
        data: require("./built-temp/base-zh-CN.json"),
        code: "zh",
        region: "CN",
    },
};
