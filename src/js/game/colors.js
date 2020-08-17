/** @typedef {"r" | "g" | "b" | "y" | "p" | "c" | "w" | "u" | "0"} ColorShortcode **/

/** @type {Color[]} **/
export const colors = ["red", "green", "blue", "yellow", "purple", "cyan", "white", "uncolored", "black"];

/** @type {ColorShortcode[]} **/
export const colorShortcodes = ["r", "g", "b", "y", "p", "c", "w", "u", "0"];

/**
 * @param {unknown} value
 * @returns {value is Color}
 **/
export function isColor(value) {
    return colors.includes(/** @type {Color} **/ (value));
}

/** @type {Record<Color, ColorShortcode>} **/
export const colorShortcodeMap = {
    red: "r",
    green: "g",
    blue: "b",
    yellow: "y",
    purple: "p",
    cyan: "c",
    white: "w",
    uncolored: "u",
    black: "0",
};

/** @type {Record<ColorShortcode, Color>} **/
export const shortcodeColorMap = {
    "r": "red",
    "g": "green",
    "b": "blue",
    "y": "yellow",
    "p": "purple",
    "c": "cyan",
    "w": "white",
    "u": "uncolored",
    "0": "black",
};

/** @type {Record<Color, HexColor>} **/
export const colorHexColorMap = {
    red: "#ff666a",
    green: "#78ff66",
    blue: "#66a7ff",
    yellow: "#fcf52a",
    purple: "#dd66ff",
    cyan: "#00fcff",
    white: "#ffffff",
    uncolored: "#aaaaaa",
    black: "#31383a",
};

/** @type {Record<Color, Record<Color, Color>>} **/
export const colorMixingMap = {
    // 255, 0, 0
    red: {
        red: "red",
        green: "yellow",
        blue: "purple",
        yellow: "yellow",
        purple: "purple",
        cyan: "white",
        white: "white",
        uncolored: "red",
        black: "red",
    },

    // 0, 255, 0
    green: {
        red: "yellow",
        blue: "cyan",
        green: "green",
        yellow: "yellow",
        purple: "white",
        cyan: "cyan",
        white: "white",
        uncolored: "green",
        black: "green",
    },

    // 0, 255, 0
    blue: {
        red: "purple",
        green: "cyan",
        blue: "blue",
        yellow: "white",
        purple: "purple",
        cyan: "cyan",
        white: "white",
        uncolored: "blue",
        black: "blue",
    },

    // 255, 255, 0
    yellow: {
        red: "yellow",
        green: "yellow",
        blue: "white",
        purple: "white",
        cyan: "white",
        yellow: "yellow",
        white: "white",
        uncolored: "yellow",
        black: "yellow",
    },

    // 255, 0, 255
    purple: {
        red: "purple",
        green: "white",
        blue: "purple",
        cyan: "white",
        yellow: "white",
        purple: "purple",
        white: "white",
        uncolored: "purple",
        black: "purple",
    },

    // 0, 255, 255
    cyan: {
        red: "white",
        green: "cyan",
        blue: "cyan",
        cyan: "cyan",
        yellow: "white",
        purple: "white",
        white: "white",
        uncolored: "cyan",
        black: "cyan",
    },

    //// SPECIAL COLORS

    // 255, 255, 255
    white: {
        red: "white",
        green: "white",
        blue: "white",
        cyan: "white",
        yellow: "white",
        purple: "white",
        white: "white",
        uncolored: "white",
        black: "uncolored",
    },

    // X, X, X
    uncolored: {
        red: "red",
        green: "green",
        blue: "blue",
        cyan: "cyan",
        yellow: "yellow",
        purple: "purple",
        white: "white",
        uncolored: "uncolored",
        black: "black",
    },

    black: {
        red: "red",
        green: "green",
        blue: "blue",
        cyan: "cyan",
        yellow: "yellow",
        purple: "purple",
        white: "uncolored",
        uncolored: "black",
        black: "black",
    },
};

for (const colorA in colorMixingMap) {
    for (const colorB in colorMixingMap[colorA]) {
        const resultColor = colorMixingMap[colorA][colorB];
        const existingResult = colorMixingMap[colorB][colorA];
        if (existingResult && existingResult !== resultColor) {
            assertAlways(
                false,
                "invalid color mixing configuration, " +
                    colorA +
                    " + " +
                    colorB +
                    " is " +
                    resultColor +
                    " but " +
                    colorB +
                    " + " +
                    colorA +
                    " is " +
                    existingResult
            );
        }
    }
}

for (const colorA in colorMixingMap) {
    for (const colorB in colorMixingMap) {
        if (!colorMixingMap[colorA][colorB]) {
            assertAlways(false, "Color mixing of", colorA, "with", colorB, "is not defined");
        }
    }
}
