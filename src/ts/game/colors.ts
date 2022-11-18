/** @enum {string} */
export const enumColors: any = {
    red: "red",
    green: "green",
    blue: "blue",
    yellow: "yellow",
    purple: "purple",
    cyan: "cyan",
    white: "white",
    uncolored: "uncolored",
};
const c: any = enumColors;
/** @enum {string} */
export const enumColorToShortcode: any = {
    [c.red]: "r",
    [c.green]: "g",
    [c.blue]: "b",
    [c.yellow]: "y",
    [c.purple]: "p",
    [c.cyan]: "c",
    [c.white]: "w",
    [c.uncolored]: "u",
};
/** @enum {enumColors} */
export const enumShortcodeToColor: any = {};
for (const key: any in enumColorToShortcode) {
    enumShortcodeToColor[enumColorToShortcode[key]] = key;
}
/** @enum {string} */
export const enumColorsToHexCode: any = {
    [c.red]: "#ff666a",
    [c.green]: "#78ff66",
    [c.blue]: "#66a7ff",
    // red + green
    [c.yellow]: "#fcf52a",
    // red + blue
    [c.purple]: "#dd66ff",
    // blue + green
    [c.cyan]: "#00fcff",
    // blue + green + red
    [c.white]: "#ffffff",
    [c.uncolored]: "#aaaaaa",
};
/** @enum {Object.<string, string>} */
export const enumColorMixingResults: any = {};
const bitfieldToColor: any = [
    /* 000 */ c.uncolored,
    /* 001 */ c.red,
    /* 010 */ c.green,
    /* 011 */ c.yellow,
    /* 100 */ c.blue,
    /* 101 */ c.purple,
    /* 110 */ c.cyan,
    /* 111 */ c.white,
];
for (let i: any = 0; i < 1 << 3; ++i) {
    enumColorMixingResults[bitfieldToColor[i]] = {};
    for (let j: any = 0; j < 1 << 3; ++j) {
        enumColorMixingResults[bitfieldToColor[i]][bitfieldToColor[j]] = bitfieldToColor[i | j];
    }
}
