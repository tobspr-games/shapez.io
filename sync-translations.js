// Synchronizes all translations

const fs = require("fs");
const matchAll = require("match-all");
const path = require("path");
const YAML = require("yaml");

const files = fs
    .readdirSync(path.join(__dirname, "translations"))
    .filter(x => x.endsWith(".yaml"))
    .filter(x => x.indexOf("base-en") < 0);

const originalContents = fs
    .readFileSync(path.join(__dirname, "translations", "base-en.yaml"))
    .toString("utf-8");

const original = YAML.parse(originalContents);

const placeholderRegexp = /[[<]([a-zA-Z_0-9/-_]+?)[\]>]/gi;

function match(originalObj, translatedObj, path = "/", ignorePlaceholderMismatch = false) {
    for (const key in originalObj) {
        if (!translatedObj.hasOwnProperty(key)) {
            console.warn(" | Missing key", path + key);
            translatedObj[key] = originalObj[key];
            continue;
        }
        const valueOriginal = originalObj[key];
        const valueMatching = translatedObj[key];
        if (typeof valueOriginal !== typeof valueMatching) {
            console.warn(" | MISMATCHING type (obj|non-obj) in", path + key);
            translatedObj[key] = originalObj[key];
            continue;
        }

        if (typeof valueOriginal === "object") {
            match(valueOriginal, valueMatching, path + key + "/", ignorePlaceholderMismatch);
        } else if (typeof valueOriginal === "string") {
            const originalPlaceholders = matchAll(valueOriginal, placeholderRegexp).toArray();
            const translatedPlaceholders = matchAll(valueMatching, placeholderRegexp).toArray();

            if (!ignorePlaceholderMismatch && originalPlaceholders.length !== translatedPlaceholders.length) {
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
    }

    for (const key in translatedObj) {
        if (!originalObj.hasOwnProperty(key)) {
            console.warn(" | Obsolete key", path + key);
            delete translatedObj[key];
        }
    }
}

for (let i = 0; i < files.length; ++i) {
    const filename = files[i];
    const filePath = path.join(__dirname, "translations", filename);
    console.log("Processing", filename);
    const translatedContents = fs.readFileSync(filePath).toString("utf-8");

    const json = YAML.parse(translatedContents);
    match(original, json, "/", filename.toLowerCase().includes("zh-cn"));

    const stringified = YAML.stringify(json, {
        indent: 4,
        simpleKeys: true,
    });
    fs.writeFileSync(filePath, stringified, "utf-8");
}
