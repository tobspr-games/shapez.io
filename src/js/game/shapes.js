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
 * @callback BeginDrawShape
 * @param {{
 * scale?: number,
 * beginPath?: boolean,
 * moveToZero?: true
 * }} args
 */

/**
 * @typedef {Object} DrawShapeParams
 * @property {number} dims
 * @property {number} innerDims
 * @property {number} layer
 * @property {number} quadrant
 * @property {CanvasRenderingContext2D} context
 * @property {string} color
 * @property {BeginDrawShape} begin
 */

/**
 * @callback DrawShape
 * @param {DrawShapeParams} args
 */

/**
 * @typedef {Object} SpawnChanceData
 * @property {number} [min=0]
 * @property {number} [max=100]
 * @property {number} [distanceMultiplier=1]
 */

/**
 * @typedef {Object} ShapeSpawnData
 * @property {string} [color="uncolored"]
 * @property {number} [minDistance=0]
 * @property {number} [maxQuarters=4]
 * @property {SpawnChanceData} [chances]
 */

/**
 * @typedef {Object} ShapeData
 * @property {string} id
 * @property {string} code
 * @property {DrawShape | string} draw
 * @property {number} tier
 * @property {ShapeSpawnData} [spawnData]
 */

/** @type {Object<string, ShapeData>} */
export const allShapeData = {
    rect: {
        id: "rect",
        code: "R",
        draw: "M 0 0 v 1 h 1 v -1 z",
        tier: 0,
        spawnData: {
            color: "uncolored",
            maxQuarters: 4,
            minDistance: 0,
            chances: {
                min: 100,
                distanceMultiplier: 0,
                max: 100,
            },
        },
    },
    circle: {
        id: "circle",
        code: "C",
        draw: "M 0 0 l 1 0 a 1 1 0 0 1 -1 1 z ",
        tier: 0,
        spawnData: {
            color: "uncolored",
            maxQuarters: 4,
            minDistance: 0,
            chances: {
                min: 50,
                distanceMultiplier: 15,
                max: 100,
            },
        },
    },
    star: {
        id: "star",
        code: "S",
        draw: "M 0 0 L 0 0.6 1 1 0.6 0 z",
        tier: 0.5,
        spawnData: {
            color: "uncolored",
            maxQuarters: 4,
            minDistance: 5,
            chances: {
                min: 20,
                distanceMultiplier: 10,
                max: 100,
            },
        },
    },
    windmill: {
        id: "windmill",
        code: "W",
        draw: "M 0 0 L 0 0.6 1 1 1 0 z",
        tier: 1,
        spawnData: {
            color: "uncolored",
            maxQuarters: 3,
            minDistance: 7,
            chances: {
                min: 20,
                distanceMultiplier: 5,
                max: 100,
            },
        },
    },
};

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
        assert(data.draw);

        enumSubShape[data.id] = data.id;
        enumSubShapeToShortcode[data.id] = data.code;
        enumShortcodeToSubShape[data.code] = data.id;

        if (data.spawnData) {
            const sdata = data.spawnData;
            sdata.color = sdata.color || "uncolored";
            sdata.maxQuarters = sdata.maxQuarters || 4;
            sdata.minDistance = sdata.minDistance || 0;

            if(sdata.chances) {
                const chances = sdata.chances;
                chances.min = chances.min || 0;
                chances.max = chances.max || 100;
                chances.distanceMultiplier = chances.distanceMultiplier || 1;
            } else {
                sdata.chances = {
                    min: 0,
                    max: 100,
                    distanceMultiplier: 1
                };
            }
        }
    }
}
