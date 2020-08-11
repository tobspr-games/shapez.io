/** @enum {string} */
export const enumColors = {
    red: "red",
    green: "green",
    blue: "blue",

    yellow: "yellow",
    purple: "purple",
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
    [enumColors.purple]: "p",
    [enumColors.cyan]: "c",

    [enumColors.white]: "w",
    [enumColors.uncolored]: "u",
};

/** @enum {enumColors} */
export const enumShortcodeToColor = {};
for (const key in enumColorToShortcode) {
    enumShortcodeToColor[enumColorToShortcode[key]] = key;
}

/** @enum {string} */
export const enumColorsToHexCode = {
    [enumColors.red]: "#ff666a",
    [enumColors.green]: "#78ff66",
    [enumColors.blue]: "#66a7ff",

    // red + green
    [enumColors.yellow]: "#fcf52a",

    // red + blue
    [enumColors.purple]: "#dd66ff",

    // blue + green
    [enumColors.cyan]: "#00fcff",

    // blue + green + red
    [enumColors.white]: "#ffffff",

    [enumColors.uncolored]: "#aaaaaa",
};

const c = enumColors;
/** @enum {Object.<string, string>} */
export const enumColorMixingResults = {
    // 255, 0, 0
    [c.red]: {
        [c.green]: c.yellow,
        [c.blue]: c.purple,

        [c.yellow]: c.yellow,
        [c.purple]: c.purple,
        [c.cyan]: c.white,

        [c.white]: c.white,
    },

    // 0, 255, 0
    [c.green]: {
        [c.blue]: c.cyan,

        [c.yellow]: c.yellow,
        [c.purple]: c.white,
        [c.cyan]: c.cyan,

        [c.white]: c.white,
    },

    // 0, 255, 0
    [c.blue]: {
        [c.yellow]: c.white,
        [c.purple]: c.purple,
        [c.cyan]: c.cyan,

        [c.white]: c.white,
    },

    // 255, 255, 0
    [c.yellow]: {
        [c.purple]: c.white,
        [c.cyan]: c.white,
    },

    // 255, 0, 255
    [c.purple]: {
        [c.cyan]: c.white,
    },

    // 0, 255, 255
    [c.cyan]: {},

    //// SPECIAL COLORS

    // 255, 255, 255
    [c.white]: {
        // auto
    },

    // X, X, X
    [c.uncolored]: {
        // auto
    },
};

// Create same color lookups
for (const color in enumColors) {
    enumColorMixingResults[color][color] = color;
    enumColorMixingResults[color][c.white] = c.white;
    // Anything with uncolored is the same color
    enumColorMixingResults[color][c.uncolored] = color;
}

// Create reverse lookup and check color mixing lookups
for (const colorA in enumColorMixingResults) {
    for (const colorB in enumColorMixingResults[colorA]) {
        const resultColor = enumColorMixingResults[colorA][colorB];
        if (!enumColorMixingResults[colorB]) {
            enumColorMixingResults[colorB] = {
                [colorA]: resultColor,
            };
        } else {
            const existingResult = enumColorMixingResults[colorB][colorA];
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
            enumColorMixingResults[colorB][colorA] = resultColor;
        }
    }
}

for (const colorA in enumColorMixingResults) {
    for (const colorB in enumColorMixingResults) {
        if (!enumColorMixingResults[colorA][colorB]) {
            assertAlways(false, "Color mixing of", colorA, "with", colorB, "is not defined");
        }
    }
}
