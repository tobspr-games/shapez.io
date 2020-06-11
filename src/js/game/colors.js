import { customColors } from "./custom/colors";

/** @enum {string} */
export const enumColors = {
    red: "red",
    green: "green",
    blue: "blue",

    yellow: "yellow",
    magenta: "magenta",
    cyan: "cyan",

    white: "white",
    uncolored: "uncolored",
};

/** @enum {string} */
export const enumColorToShortcode = {
    [enumColors.red]: "r",
    [enumColors.green]: "g",
    [enumColors.blue]: "b",

    [enumColors.yellow]: "y",
    [enumColors.magenta]: "p",
    [enumColors.cyan]: "c",

    [enumColors.white]: "w",
    [enumColors.uncolored]: "u",
};

/** @enum {enumColors} */
export const enumShortcodeToColor = {};

/** @enum {string} */
export const enumColorsToHexCode = {};

const c = enumColors;
/** @enum {Object.<string, Object>} */
export const enumColorMixingResults = {};

/**
 * @typedef {Object} ColorData
 * @property {string} id
 * @property {string} code
 * @property {string} hex
 * @property {string[][] | string[]} [mixingFrom]
 * @property {Object.<string, string>} [mixing]
 * @property {boolean} [spawnable]
 * @property {number} [minDistance]
 */

/** @enum {ColorData} */
export const allColorData = {
    uncolored: {
        id: "uncolored",
        code: "u",
        hex: "#aaaaaa",
        mixing: {
            any: "any",
        },
    },
    red: {
        id: "red",
        code: "r",
        hex: "#ff666a",
        // no recipes
        spawnable: true,
    },
    green: {
        id: "green",
        code: "g",
        hex: "#78ff66",
        // no recipes
        spawnable: true,
    },
    blue: {
        id: "blue",
        code: "b",
        hex: "#66a7ff",
        // no recipes
        spawnable: true,
        minDistance: 3,
    },
    cyan: {
        id: "cyan",
        code: "c",
        hex: "#00fcff",
        mixingFrom: ["green", "blue"],
        mixing: {
            green: "this",
            blue: "this",
        },
    },
    magenta: {
        id: "magenta",
        code: "p",
        hex: "#dd66ff",
        mixingFrom: ["red", "blue"],
        mixing: {
            red: "this",
            blue: "this",
        },
    },
    yellow: {
        id: "yellow",
        code: "y",
        hex: "#fcf52a",
        mixingFrom: ["red", "green"],
        mixing: {
            red: "this",
            green: "this",
        },
    },
    white: {
        id: "white",
        code: "w",
        hex: "#ffffff",
        mixing: {
            any: "white",
        },
        mixingFrom: [
            ["red", "cyan"],
            ["green", "magenta"],
            ["blue", "yellow"],
            ["cyan", "magenta"],
            ["cyan", "yellow"],
            ["magenta", "yellow"],
        ],
    },
};

/**
 * @param {Object} colorData
 * @property {string} colorData.id
 * @property {string} colorData.code
 * @property {string} colorData.hex
 * @property {Object.<string, string>} [colorData.mixing]
 * @property {string[2][] | string[2]} [colorData.mixingFrom]
 */
function registerColor(colorData) {
    allColorData[colorData.id] = colorData;
}

export let allowColorMixingMismatch = false;
export let allowColorMixingOverride = false;
export let allowColorMixingMissingSource = false;
export let allowColorMixingMissingTarget = false;

for (let data of customColors) {
    registerColor(data);
}

const mix = enumColorMixingResults;

initColors();

export function initColors() {
    for (let c1 in allColorData) {
        let data = allColorData[c1];
        assert(data);
        assert(data.id == c1);
        assert(data.code.toLowerCase() == data.code);
        if (data.disabled) {
            continue;
        }
        if (data.spawnable && !data.minDistance) {
            data.minDistance = 0;
        }
        enumColors[c1] = c1;
        enumColorToShortcode[c1] = data.code;
        enumShortcodeToColor[data.code] = c1;
        enumColorsToHexCode[c1] = data.hex;
        if (!mix[c1]) {
            mix[c1] = {};
        }
        let mixing = mix[c1];
        if (data.mixing) {
            for (let c2 in data.mixing) {
                if (c2 == "any") {
                    continue;
                }
                let result = data.mixing[c2] == "this" ? c1 : data.mixing[c2] == "any" ? c2 : data.mixing[c2];
                if (mixing[c2] && mixing[c2] != result) {
                    if (!allowColorMixingOverride) {
                        assertAlways(
                            false,
                            `Color mixing recipe overrides are not implemented (${c1}+${c2}=${mixing[c2]}->${result})`
                        );
                    }
                }
                mixing[c2] = result;
            }
        }
    }
    for (let id in allColorData) {
        let data = allColorData[id];
        let mixingFrom = !data.mixingFrom
            ? []
            : data.mixingFrom[0] instanceof Array
            ? data.mixingFrom
            : [data.mixingFrom];
        for (let [c1, c2] of mixingFrom) {
            if (!c[c1] || !c[c2]) {
                if (!allowColorMixingMissingSource) {
                    assertAlways(false, `Color mixing recipe source is not known (${c1}+${c2}=${id})`);
                }
                continue;
            }
            if (mix[c1][c2] && mix[c1][c2] != id) {
                // TODO
                throw "wut";
            }
            if (mix[c2][c1] && mix[c2][c1] != id) {
                // TODO
                throw "wut";
            }
            mix[c1][c2] = id;
        }
    }
    for (let c1 in c) {
        for (let c2 in c) {
            if (mix[c1][c2] != mix[c2][c1]) {
                if (mix[c1][c2] && mix[c2][c1] && !allowColorMixingMismatch) {
                    assertAlways(
                        false,
                        `Color mixing recipe result mismatch (${c1}+${c2}=${mix[c1][c2]}/${mix[c2][c1]}}`
                    );
                }
                mix[c1][c2] = mix[c2][c1] = mix[c1][c2] || mix[c2][c1];
            }
        }
    }
    for (let c1 in c) {
        if (!mix[c1][c1]) {
            mix[c1][c1] = c1;
        }
    }
    let anyPairs = {};
    for (let c1 in c) {
        let mixing = allColorData[c1].mixing;
        if (!mixing || !mixing.any) {
            continue;
        }
        for (let c2 in c) {
            if (mix[c1][c2] || mix[c2][c1]) {
                continue;
            }
            if (anyPairs[`${c1}+${c2}`]) {
                throw "wut";
            }
            anyPairs[`${c1}+${c2}`] = anyPairs[`${c2}+${c1}`] = true;
            mix[c1][c2] = mix[c2][c1] = mixing.any == "any" ? c2 : mixing.any;
        }
    }
    for (let c1 in c) {
        for (let c2 in c) {
            if (!mix[c1][c2]) {
                assertAlways(false, "Color mixing of", c1, "with", c2, "is not defined");
            }
        }
    }
}
