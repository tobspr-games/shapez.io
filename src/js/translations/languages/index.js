import cs from "./cs";
import de from "./de";
import en from "./en";
import es419 from "./es-419";
import fr from "./fr";
import ja from "./ja";
import kor from "./kor";
import nl from "./nl";
import no from "./no";
import pl from "./pl";
import ptPT from "./pt-PT";
import ptBR from "./pt-BR";
import ru from "./ru";
import sv from "./sv";
import tr from "./tr";
import zhCN from "./zh-CN";
import zhTW from "./zh-TW";

/**
 * @typedef {"en" | "de" | "fr" | "ja" | "pt-PT" | "pt-BR" | "ru" | "cs" | "es-419" | "pl" | "kor" | "nl" | "no" | "tr" | "zh-CN" | "zh-TW" | "sv"} LanguageTag
 */

/** @type {LanguageTag[]} **/
export const languageTags = [
    "en",
    "de",
    "fr",
    "ja",
    "pt-PT",
    "pt-BR",
    "ru",
    "cs",
    "es-419",
    "pl",
    "kor",
    "nl",
    "no",
    "tr",
    "zh-CN",
    "zh-TW",
    "sv",
];

/**
 * @param {unknown} value
 * @returns {value is LanguageTag}
 **/
export function isLanguageTag(value) {
    return languageTags.includes(/** @type {LanguageTag} **/ (value));
}

/** @typedef {"en" | "de" | "fr" | "ja" | "pt" | "ru" | "cs" | "es" | "pl" | "kor" | "nl" | "no" | "tr" | "zh" | "sv"} LanguageCode
 */

/** @type {LanguageCode[]} **/
const languageCodes = [
    "en",
    "de",
    "fr",
    "ja",
    "pt",
    "ru",
    "cs",
    "es",
    "pl",
    "kor",
    "nl",
    "no",
    "tr",
    "zh",
    "sv",
];

/** @typedef {"PT" | "BR" | "CN" | "TW"} LanguageRegion **/
/** @type {LanguageRegion[]} **/
const languageRegions = ["PT", "BR", "CN", "TW"];

/**
 * @type {Record<LanguageTag, {name: string, data: Translations, code: LanguageCode, region?: LanguageRegion}>}
 */
export default {
    cs,
    de,
    en,
    "es-419": es419,
    fr,
    ja,
    kor,
    nl,
    no,
    pl,
    "pt-BR": ptBR,
    "pt-PT": ptPT,
    ru,
    sv,
    tr,
    "zh-CN": zhCN,
    "zh-TW": zhTW,
};
