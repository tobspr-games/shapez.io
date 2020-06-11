/** @enum {string} */
export const customShapes = [];

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

/**
 * @param {ShapeData} shapeData
 */
export function registerCustomShape(shapeData) {
    customShapes.push(shapeData);
}

// registerCustomShape({
//     id: "clover",
//     code: "L",
//     spawnable: true,
//     spawnColor: "green",
//     maxQuarters: 4,
//     minDistance: 6,
//     minChance: 4,
//     distChance: 1/3,
//     maxChance: 12,
//     draw({ dims, innerDims, layer, quad, context, color, begin }) {
//         begin({ size: 1.3, path: true, zero: true });
//         const inner = 0.5;
//         const inner_center = 0.45;
//         context.lineTo(0, inner);
//         context.bezierCurveTo(0, 1,  inner, 1,  inner_center, inner_center);
//         context.bezierCurveTo(1, inner,  1, 0,  inner, 0);
//     },
// });
