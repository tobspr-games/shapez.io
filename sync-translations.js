// Synchronizes all translations

const fs = require("fs");
const matchAll = require("match-all");
const path = require("path");
const YAWN = require("yawn-yaml/cjs");
const YAML = require("yaml");

const files = fs
    .readdirSync(path.join(__dirname, "translations"))
    .filter(x => x.endsWith(".yaml"))
    .filter(x => x.indexOf("base-en") < 0);

const originalContents = fs
    .readFileSync(path.join(__dirname, "translations", "base-en.yaml"))
    .toString("utf-8");

const original = YAML.parse(originalContents);

const placeholderRegexp = /<([a-zA-Z_0-9]+)>/gi;

function match(originalObj, translatedObj, path = "/") {
    for (const key in originalObj) {
        if (!translatedObj[key]) {
            console.warn(" | Missing key", path + key);
            translatedObj[key] = originalObj[key];
            continue;
        }
        const valueOriginal = originalObj[key];
        const valueMatching = translatedObj[key];
        if (typeof valueOriginal !== typeof valueMatching) {
            console.warn(" | MISMATCHING type (obj|non-obj) in", path + key);
            continue;
        }

        if (typeof valueOriginal === "object") {
            match(valueOriginal, valueMatching, path + key + "/");
        } else if (typeof valueOriginal === "string") {
            // todo
            const originalPlaceholders = matchAll(valueOriginal, placeholderRegexp).toArray();
            const translatedPlaceholders = matchAll(valueMatching, placeholderRegexp).toArray();

            if (originalPlaceholders.length !== translatedPlaceholders.length) {
                console.warn(
                    " | Mismatching placeholders in",
                    path + key,
                    "->",
                    originalPlaceholders,
                    "vs",
                    translatedPlaceholders
                );
                translatedObj[key] = originalObj[key];
                continue;
            }
        } else {
            console.warn(" | Unknown type: ", typeof valueOriginal);
        }

        // const matching = translatedObj[key];
    }

    for (const key in translatedObj) {
        if (!originalObj[key]) {
            console.warn(" | Obsolete key", path + key);
            delete translatedObj[key];
        }
    }
}

for (let i = 0; i < files.length; ++i) {
    const filePath = path.join(__dirname, "translations", files[i]);
    console.log("Processing", files[i]);
    const translatedContents = fs.readFileSync(filePath).toString("utf-8");
    const translated = YAML.parse(translatedContents);
    const handle = new YAWN(translatedContents);

    const json = handle.json;
    match(original, json, "/");
    handle.json = json;

    fs.writeFileSync(filePath, handle.yaml, "utf-8");
}
