import { makeOffscreenBuffer } from "../core/buffer_utils";
import { globalConfig } from "../core/config";
import { smoothenDpi } from "../core/dpi_manager";
import { DrawParameters } from "../core/draw_parameters";
import { Vector } from "../core/vector";
import { BasicSerializableObject, types } from "../savegame/serialization";
import { enumColors, enumColorsToHexCode, enumColorToShortcode, enumShortcodeToColor } from "./colors";
import { THEME } from "./theme";
import { allShapeData, ShapeData, enumShortcodeToSubShape, enumSubShapeToShortcode, enumSubShape } from "./shapes";

/**
 * @typedef {{
 *   subShape: enumSubShape,
 *   color: enumColors,
 * }} ShapeLayerItem
 */

/**
 * Order is Q1 (tr), Q2(br), Q3(bl), Q4(tl)
 * @typedef {[ShapeLayerItem?, ShapeLayerItem?, ShapeLayerItem?, ShapeLayerItem?]} ShapeLayer
 */

const arrayQuadrantIndexToOffset = [
    new Vector(1, -1), // tr
    new Vector(1, 1), // br
    new Vector(-1, 1), // bl
    new Vector(-1, -1), // tl
];

/**
 * Converts the given parameters to a valid shape definition
 * @param {*} layers
 * @returns {Array<import("./shape_definition").ShapeLayer>}
 */
export function createSimpleShape(layers) {
    layers.forEach(layer => {
        layer.forEach(item => {
            if (item) {
                item.color = item.color || enumColors.uncolored;
            }
        });
    });
    return layers;
}

/**
 * Cache which shapes are valid short keys and which not
 * @type {Map<string, boolean>}
 */
const SHORT_KEY_CACHE = new Map();

export class ShapeDefinition extends BasicSerializableObject {
    static getId() {
        return "ShapeDefinition";
    }

    static getSchema() {
        return {};
    }

    deserialize(data) {
        const errorCode = super.deserialize(data);
        if (errorCode) {
            return errorCode;
        }
        const definition = ShapeDefinition.fromShortKey(data);
        /** @type {Array<ShapeLayer>} */
        this.layers = /** @type {Array<ShapeLayer>} */ (definition.layers);
    }

    serialize() {
        return this.getHash();
    }

    /**
     *
     * @param {object} param0
     * @param {Array<ShapeLayer>=} param0.layers
     */
    constructor({ layers = [] }) {
        super();

        /**
         * The layers from bottom to top
         * @type {Array<ShapeLayer>}
         */
        this.layers = layers;

        /** @type {string} */
        this.cachedHash = null;

        // Set on demand
        this.bufferGenerator = null;
    }

    /**
     * Generates the definition from the given short key
     * @param {string} key
     * @returns {ShapeDefinition}
     */
    static fromShortKey(key) {
        const sourceLayers = key.split(":");
        let layers = [];
        for (let i = 0; i < sourceLayers.length; ++i) {
            const text = sourceLayers[i];
            assert(text.length === 8, "Invalid shape short key: " + key);

            /** @type {ShapeLayer} */
            const quads = [null, null, null, null];
            for (let quad = 0; quad < 4; ++quad) {
                const shapeText = text[quad * 2 + 0];
                const subShape = enumShortcodeToSubShape[shapeText];
                const color = enumShortcodeToColor[text[quad * 2 + 1]];
                if (subShape) {
                    assert(color, "Invalid shape short key:", key);
                    quads[quad] = {
                        subShape,
                        color,
                    };
                } else if (shapeText !== "-") {
                    assert(false, "Invalid shape key: " + shapeText);
                }
            }
            layers.push(quads);
        }

        const definition = new ShapeDefinition({ layers });
        // We know the hash so save some work
        definition.cachedHash = key;
        return definition;
    }

    /**
     * Checks if a given string is a valid short key
     * @param {string} key
     * @returns {boolean}
     */
    static isValidShortKey(key) {
        if (SHORT_KEY_CACHE.has(key)) {
            return SHORT_KEY_CACHE.get(key);
        }

        const result = ShapeDefinition.isValidShortKeyInternal(key);
        SHORT_KEY_CACHE.set(key, result);
        return result;
    }

    /**
     * INTERNAL
     * Checks if a given string is a valid short key
     * @param {string} key
     * @returns {boolean}
     */
    static isValidShortKeyInternal(key) {
        const sourceLayers = key.split(":");
        let layers = [];
        for (let i = 0; i < sourceLayers.length; ++i) {
            const text = sourceLayers[i];
            if (text.length !== 8) {
                return false;
            }

            /** @type {ShapeLayer} */
            const quads = [null, null, null, null];
            let anyFilled = false;
            for (let quad = 0; quad < 4; ++quad) {
                const shapeText = text[quad * 2 + 0];
                const colorText = text[quad * 2 + 1];
                const subShape = enumShortcodeToSubShape[shapeText];
                const color = enumShortcodeToColor[colorText];

                // Valid shape
                if (subShape) {
                    if (!color) {
                        // Invalid color
                        return false;
                    }
                    quads[quad] = {
                        subShape,
                        color,
                    };
                    anyFilled = true;
                } else if (shapeText === "-") {
                    // Make sure color is empty then, too
                    if (colorText !== "-") {
                        return false;
                    }
                } else {
                    // Invalid shape key
                    return false;
                }
            }

            if (!anyFilled) {
                // Empty layer
                return false;
            }
            layers.push(quads);
        }

        if (layers.length === 0 || layers.length > 4) {
            return false;
        }

        return true;
    }

    /**
     * Internal method to clone the shape definition
     * @returns {Array<ShapeLayer>}
     */
    internalCloneLayers() {
        return JSON.parse(JSON.stringify(this.layers));
    }

    /**
     * Returns if the definition is entirely empty^
     * @returns {boolean}
     */
    isEntirelyEmpty() {
        return this.layers.length === 0;
    }

    /**
     * Returns a unique id for this shape
     * @returns {string}
     */
    getHash() {
        if (this.cachedHash) {
            return this.cachedHash;
        }

        let id = "";
        for (let layerIndex = 0; layerIndex < this.layers.length; ++layerIndex) {
            const layer = this.layers[layerIndex];

            for (let quadrant = 0; quadrant < layer.length; ++quadrant) {
                const item = layer[quadrant];
                if (item) {
                    id += enumSubShapeToShortcode[item.subShape] + enumColorToShortcode[item.color];
                } else {
                    id += "--";
                }
            }

            if (layerIndex < this.layers.length - 1) {
                id += ":";
            }
        }
        this.cachedHash = id;
        return id;
    }

    /**
     * Draws the shape definition
     * @param {number} x
     * @param {number} y
     * @param {DrawParameters} parameters
     * @param {number=} diameter
     */
    drawCentered(x, y, parameters, diameter = 20) {
        const dpi = smoothenDpi(globalConfig.shapesSharpness * parameters.zoomLevel);

        if (!this.bufferGenerator) {
            this.bufferGenerator = this.internalGenerateShapeBuffer.bind(this);
        }

        const key = diameter + "/" + dpi + "/" + this.cachedHash;
        const canvas = parameters.root.buffers.getForKey({
            key: "shapedef",
            subKey: key,
            w: diameter,
            h: diameter,
            dpi,
            redrawMethod: this.bufferGenerator,
        });
        parameters.context.drawImage(canvas, x - diameter / 2, y - diameter / 2, diameter, diameter);
    }

    /**
     * Generates this shape as a canvas
     * @param {number} size
     */
    generateAsCanvas(size = 120) {
        const [canvas, context] = makeOffscreenBuffer(size, size, {
            smooth: true,
            label: "definition-canvas-cache-" + this.getHash(),
            reusable: false,
        });

        this.internalGenerateShapeBuffer(canvas, context, size, size, 1);
        return canvas;
    }

    /**
     *
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    internalGenerateShapeBuffer(canvas, context, w, h, dpi) {
        context.translate((w * dpi) / 2, (h * dpi) / 2);
        context.scale((dpi * w) / 23, (dpi * h) / 23);

        context.fillStyle = "#e9ecf7";

        const quadrantSize = 10;
        const quadrantHalfSize = quadrantSize / 2;

        context.fillStyle = THEME.items.circleBackground;
        context.beginCircle(0, 0, quadrantSize * 1.15);
        context.fill();

        for (let layerIndex = 0; layerIndex < this.layers.length; ++layerIndex) {
            const quadrants = this.layers[layerIndex];

            let quads = quadrants
                .map((e, i) => ({ e, i }))
                .filter(e => e.e)
                .map(e => ({ ...e.e, quadrantIndex: e.i }))
            const layerScale = Math.max(0.1, 0.9 - layerIndex * 0.22);

            for (let quad of quads) {
                if (!quad) {
                    continue;
                }
                const { subShape, color, quadrantIndex } = quad;
                if (subShape == "-") {
                    continue;
                }

                const quadrantPos = arrayQuadrantIndexToOffset[quadrantIndex];

                const centerQuadrantX = quadrantPos.x * quadrantHalfSize;
                const centerQuadrantY = quadrantPos.y * quadrantHalfSize;

                const rotation = Math.radians(quadrantIndex * 90);

                context.save();
                context.translate(centerQuadrantX, centerQuadrantY);
                context.rotate(rotation);

                context.fillStyle = enumColorsToHexCode[color];
                context.strokeStyle = THEME.items.outline;
                const lineWidth = THEME.items.outlineWidth * Math.pow(0.8, layerIndex);
                context.lineWidth = lineWidth;

                const insetPadding = 0.0;

                const dims = quadrantSize * layerScale;
                const innerDims = insetPadding - quadrantHalfSize;
                
                let began = null;
                // eslint-disable-next-line no-inner-declarations
                /** @type {import("./shapes").BeginDrawShape} */
                function begin(args) {
                    context.save();
                    context.translate(innerDims, -innerDims);
                    context.scale(dims, -dims);
                    context.lineWidth = lineWidth / dims / (args.scale || 1);
                    if (args.scale) {
                        context.scale(args.scale, args.scale);
                    }
                    if (args.beginPath) {
                        context.beginPath();
                    }
                    if (args.moveToZero) {
                        context.moveTo(0, 0);
                    }
                    began = args;
                }
                // eslint-disable-next-line no-inner-declarations
                function end() {
                    if (!began) {
                        return;
                    }
                    if (began.path) {
                        context.closePath();
                    }
                    context.restore();
                }

                /** @type {ShapeData} */
                let shape = allShapeData[subShape];
                assertAlways(shape.draw, "shape should be drawable!");
                if (typeof shape.draw === "string") {
                    let draw = shape.draw;
                    begin({ scale: 1 });
                    let p = new Path2D(draw);
                    context.fill(p);
                    context.stroke(p);
                    end();
                } else {
                    shape.draw({
                        dims,
                        innerDims,
                        layer: layerIndex,
                        quadrant: quadrantIndex,
                        context,
                        color,
                        begin,
                    });
                    end();
                    context.fill();
                    context.stroke();
                }

                context.restore();
            }
        }
    }

    /**
     * Returns a definition with only the given quadrants
     * @param {Array<number>} includeQuadrants
     * @returns {ShapeDefinition}
     */
    cloneFilteredByQuadrants(includeQuadrants) {
        const newLayers = this.internalCloneLayers();
        for (let layerIndex = 0; layerIndex < newLayers.length; ++layerIndex) {
            const quadrants = newLayers[layerIndex];
            let anyContents = false;
            for (let quadrantIndex = 0; quadrantIndex < 4; ++quadrantIndex) {
                if (includeQuadrants.indexOf(quadrantIndex) < 0) {
                    quadrants[quadrantIndex] = null;
                } else if (quadrants[quadrantIndex]) {
                    anyContents = true;
                }
            }

            // Check if the layer is entirely empty
            if (!anyContents) {
                newLayers.splice(layerIndex, 1);
                layerIndex -= 1;
            }
        }
        return new ShapeDefinition({ layers: newLayers });
    }

    /**
     * Returns a definition which was rotated clockwise
     * @returns {ShapeDefinition}
     */
    cloneRotateCW() {
        const newLayers = this.internalCloneLayers();
        for (let layerIndex = 0; layerIndex < newLayers.length; ++layerIndex) {
            const quadrants = newLayers[layerIndex];
            quadrants.unshift(quadrants[3]);
            quadrants.pop();
        }
        return new ShapeDefinition({ layers: newLayers });
    }

    /**
     * Returns a definition which was rotated counter clockwise
     * @returns {ShapeDefinition}
     */
    cloneRotateCCW() {
        const newLayers = this.internalCloneLayers();
        for (let layerIndex = 0; layerIndex < newLayers.length; ++layerIndex) {
            const quadrants = newLayers[layerIndex];
            quadrants.push(quadrants[0]);
            quadrants.shift();
        }
        return new ShapeDefinition({ layers: newLayers });
    }

    /**
     * Returns a definition which was rotated 180 degrees (flipped)
     * @returns {ShapeDefinition}
     */
    cloneRotateFL() {
        const newLayers = this.internalCloneLayers();
        for (let layerIndex = 0; layerIndex < newLayers.length; ++layerIndex) {
            const quadrants = newLayers[layerIndex];
            quadrants.push(quadrants.shift(), quadrants.shift());
        }
        return new ShapeDefinition({ layers: newLayers });
    }

    /**
     * Stacks the given shape definition on top.
     * @param {ShapeDefinition} definition
     */
    cloneAndStackWith(definition) {
        if (this.isEntirelyEmpty() || definition.isEntirelyEmpty()) {
            assert(false, "Can not stack entirely empty definition");
        }

        const bottomShapeLayers = this.layers;
        const bottomShapeHighestLayerByQuad = [-1, -1, -1, -1];

        for (let layer = bottomShapeLayers.length - 1; layer >= 0; --layer) {
            const shapeLayer = bottomShapeLayers[layer];
            for (let quad = 0; quad < 4; ++quad) {
                const shapeQuad = shapeLayer[quad];
                if (shapeQuad !== null && bottomShapeHighestLayerByQuad[quad] < layer) {
                    bottomShapeHighestLayerByQuad[quad] = layer;
                }
            }
        }

        const topShapeLayers = definition.layers;
        const topShapeLowestLayerByQuad = [4, 4, 4, 4];

        for (let layer = 0; layer < topShapeLayers.length; ++layer) {
            const shapeLayer = topShapeLayers[layer];
            for (let quad = 0; quad < 4; ++quad) {
                const shapeQuad = shapeLayer[quad];
                if (shapeQuad !== null && topShapeLowestLayerByQuad[quad] > layer) {
                    topShapeLowestLayerByQuad[quad] = layer;
                }
            }
        }

        /**
         * We want to find the number `layerToMergeAt` such that when the top shape is placed at that
         * layer, the smallest gap between shapes is only 1. Instead of doing a guess-and-check method to
         * find the appropriate layer, we just calculate all the gaps assuming a merge at layer 0, even
         * though they go negative, and calculating the number to add to it so the minimum gap is 1 (ends
         * up being 1 - minimum).
         */
        const gapsBetweenShapes = [];
        for (let quad = 0; quad < 4; ++quad) {
            gapsBetweenShapes.push(topShapeLowestLayerByQuad[quad] - bottomShapeHighestLayerByQuad[quad]);
        }
        const smallestGapBetweenShapes = Math.min(...gapsBetweenShapes);
        // Can't merge at a layer lower than 0
        const layerToMergeAt = Math.max(1 - smallestGapBetweenShapes, 0);

        const mergedLayers = this.internalCloneLayers();
        for (let layer = mergedLayers.length; layer < layerToMergeAt + topShapeLayers.length; ++layer) {
            mergedLayers.push([null, null, null, null]);
        }

        for (let layer = 0; layer < topShapeLayers.length; ++layer) {
            const layerMergingAt = layerToMergeAt + layer;
            const bottomShapeLayer = mergedLayers[layerMergingAt];
            const topShapeLayer = topShapeLayers[layer];
            for (let quad = 0; quad < 4; quad++) {
                assert(!(bottomShapeLayer[quad] && topShapeLayer[quad]), "Shape merge: Sub shape got lost");
                bottomShapeLayer[quad] = bottomShapeLayer[quad] || topShapeLayer[quad];
            }
        }

        // Limit to 4 layers at max
        mergedLayers.splice(4);

        return new ShapeDefinition({ layers: mergedLayers });
    }

    /**
     * Clones the shape and colors everything in the given color
     * @param {enumColors} color
     */
    cloneAndPaintWith(color) {
        const newLayers = this.internalCloneLayers();

        for (let layerIndex = 0; layerIndex < newLayers.length; ++layerIndex) {
            const quadrants = newLayers[layerIndex];
            for (let quadrantIndex = 0; quadrantIndex < 4; ++quadrantIndex) {
                const item = quadrants[quadrantIndex];
                if (item) {
                    item.color = color;
                }
            }
        }
        return new ShapeDefinition({ layers: newLayers });
    }

    /**
     * Clones the shape and colors everything in the given colors
     * @param {[enumColors, enumColors, enumColors, enumColors]} colors
     */
    cloneAndPaintWith4Colors(colors) {
        const newLayers = this.internalCloneLayers();

        for (let layerIndex = 0; layerIndex < newLayers.length; ++layerIndex) {
            const quadrants = newLayers[layerIndex];
            for (let quadrantIndex = 0; quadrantIndex < 4; ++quadrantIndex) {
                const item = quadrants[quadrantIndex];
                if (item) {
                    item.color = colors[quadrantIndex] || item.color;
                }
            }
        }
        return new ShapeDefinition({ layers: newLayers });
    }
}
