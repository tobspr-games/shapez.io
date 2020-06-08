/** @enum {string} */
export const customColors = [];

/**
 * @param {Object} colorData
 * @param {string} colorData.id
 * @param {string} colorData.code
 * @param {string} colorData.hex
 * @param {string[][] | string[]} [colorData.mixingFrom]
 * @param {Object.<string, string>} [colorData.mixing]
 * @param {boolean} [colorData.spawnable]
 * @param {number} [colorData.minDistance]
 */
export function registerCustomColor(colorData) {
    customColors.push(colorData);
}

registerCustomColor({
    id: "black",
    code: "k",
    hex: "#333333",
    mixing: {
        white: "uncolored",
        uncolored: "uncolored",
        any: "black",
    },
    spawnable: true,
    minDistance: 5,
});
