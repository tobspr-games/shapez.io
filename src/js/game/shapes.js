import { enumColors } from "./colors";
import { customShapes } from "./custom/shapes";

/** @enum {string} */
export const enumSubShape = {
    rect: "rect",
    circle: "circle",
    star: "star",
    windmill: "windmill",
};

/** @enum {string} */
export const enumSubShapeToShortcode = {
    [enumSubShape.rect]: "R",
    [enumSubShape.circle]: "C",
    [enumSubShape.star]: "S",
    [enumSubShape.windmill]: "W",
};

/** @enum {enumSubShape} */
export const enumShortcodeToSubShape = {};
for (const key in enumSubShapeToShortcode) {
    enumShortcodeToSubShape[enumSubShapeToShortcode[key]] = key;
}

/**
 * @callback DrawShape
 * @param {Object} args
 */

/**
 * @typedef {Object} ShapeData
 * @property {string} id
 * @property {string} code
 * @property {boolean} [spawnable]
 * @property {string} [spawnColor]
 * @property {number} [maxQuarters]
 * @property {number} [minDistance]
 * @property {number} [minChance]
 * @property {number} [distChance]
 * @property {number} [maxChance]
 * @property {DrawShape} draw
 */

/** @enum {ShapeData} */
export const allShapeData = {
    rect: {
        id: "rect",
        code: "R",
        spawnable: true,
        spawnColor: "uncolored",
        maxQuarters: 4,
        minDistance: 0,
        minChance: 100,
        distChance: 0,
        maxChance: 100,
        draw: drawRect,
    },
    circle: {
        id: "circle",
        code: "C",
        spawnable: true,
        spawnColor: "uncolored",
        maxQuarters: 4,
        minDistance: 0,
        minChance: 50,
        distChance: 2,
        maxChance: 100,
        draw: drawCircle,
    },
    star: {
        id: "star",
        code: "S",
        spawnable: true,
        spawnColor: "uncolored",
        maxQuarters: 4,
        minDistance: 7,
        minChance: 20 + 7,
        distChance: 1,
        maxChance: 50,
        draw: drawStar,
    },
    windmill: {
        id: "windmill",
        code: "W",
        spawnable: true,
        spawnColor: "uncolored",
        maxQuarters: 2,
        minDistance: 7,
        minChance: 6 + 7 / 2,
        distChance: 1 / 2,
        maxChance: 26,
        draw: drawWindmill,
    },
};

for (let data of customShapes) {
    allShapeData[data.id] = data;
}

initShapes();

export function initShapes() {
    for (let k in enumSubShape) {
        delete enumSubShape[k];
    }
    for (let k in enumSubShapeToShortcode) {
        delete enumSubShapeToShortcode[k];
    }
    for (let k in enumShortcodeToSubShape) {
        delete enumShortcodeToSubShape[k];
    }
    
    for (let s in allShapeData) {
        let data = allShapeData[s];
        assert(data.id == s);
        assert(data.code.toUpperCase() == data.code);
        enumSubShape[data.id] = data.id;
        enumSubShapeToShortcode[data.id] = data.code;
        enumShortcodeToSubShape[data.code] = data.id;
        if (data.spawnable) {
            data.spawnColor = data.spawnColor || "uncolored";
            assert(enumColors[data.spawnColor], "should have known initial color");
            data.maxQuarters = data.maxQuarters || 4;
            data.minDistance = data.minDistance || 0;
            assert(data.minChance > 0 || data.distChance > 0, "should have chance to spawn");
            data.minChance = data.minChance || 0;
            data.distChance = data.distChance || 0;
            data.maxChance = data.maxChance || 999999;
        }
    }
}

/** @type {DrawShape} */
function drawRect({ dims, innerDims, layer, quad, context, color, begin }) {
    begin({ size: 1, path: true, zero: true });
    context.lineTo(0, 1);
    context.lineTo(1, 1);
    context.lineTo(1, 0);
}

/** @type {DrawShape} */
function drawCircle({ dims, innerDims, layer, quad, context, color, begin }) {
    begin({ size: 1, path: true, zero: true });
    context.arc(0, 0, 1, 0, 0.5 * Math.PI);
}

/** @type {DrawShape} */
function drawStar({ dims, innerDims, layer, quad, context, color, begin }) {
    begin({ size: 1, path: true, zero: true });
    const inner = 0.6;
    context.lineTo(0, inner);
    context.lineTo(1, 1);
    context.lineTo(inner, 0);
}

/** @type {DrawShape} */
function drawWindmill({ dims, innerDims, layer, quad, context, color, begin }) {
    begin({ size: 1, path: true, zero: true });
    const inner = 0.6;
    context.lineTo(0, inner);
    context.lineTo(1, 1);
    context.lineTo(1, 0);
}
