import { enumSubShape, enumSubShapeToShortcode, enumShortcodeToSubShape, allShapeData } from "./shapes.js";
export { enumSubShape, enumSubShapeToShortcode, enumShortcodeToSubShape } from "./shapes.js";
import { makeOffscreenBuffer } from "../core/buffer_utils";
import { JSON_parse, JSON_stringify, Math_max, Math_PI, Math_radians } from "../core/builtins";
import { globalConfig } from "../core/config";
import { smoothenDpi } from "../core/dpi_manager";
import { DrawParameters } from "../core/draw_parameters";
import { createLogger } from "../core/logging";
import { Vector } from "../core/vector";
import { BasicSerializableObject, types } from "../savegame/serialization";
import { enumColors, enumColorsToHexCode, enumColorToShortcode, enumShortcodeToColor } from "./colors";
import { THEME } from "./theme";

const rusha = require("rusha");

const logger = createLogger("shape_definition");

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
        this.layers = definition.layers;
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
         * @type {Array<ShapeLayer>} */
        this.layers = layers;

        /** @type {string} */
        this.cachedHash = null;

        // Set on demand
        this.bufferGenerator = null;
    }

    /**
     * Generates the definition from the given short key
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
     * Internal method to clone the shape definition
     * @returns {Array<ShapeLayer>}
     */
    internalCloneLayers() {
        return JSON_parse(JSON_stringify(this.layers));
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
     */
    draw(x, y, parameters, size = 20) {
        const dpi = smoothenDpi(globalConfig.shapesSharpness * parameters.zoomLevel);

        if (!this.bufferGenerator) {
            this.bufferGenerator = this.internalGenerateShapeBuffer.bind(this);
        }

        const key = size + "/" + dpi;
        const canvas = parameters.root.buffers.getForKey(
            key,
            this.cachedHash,
            size,
            size,
            dpi,
            this.bufferGenerator
        );
        parameters.context.drawImage(canvas, x - size / 2, y - size / 2, size, size);
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

        context.fillStyle = "rgba(40, 50, 65, 0.1)";
        context.beginCircle(0, 0, quadrantSize * 1.15);
        context.fill();

        for (let layerIndex = 0; layerIndex < this.layers.length; ++layerIndex) {
            const quadrants = this.layers[layerIndex];

            const layerScale = Math_max(0.1, 0.9 - layerIndex * 0.22);

            for (let quadrantIndex = 0; quadrantIndex < 4; ++quadrantIndex) {
                if (!quadrants[quadrantIndex]) {
                    continue;
                }
                const { subShape, color } = quadrants[quadrantIndex];

                const quadrantPos = arrayQuadrantIndexToOffset[quadrantIndex];
                const centerQuadrantX = quadrantPos.x * quadrantHalfSize;
                const centerQuadrantY = quadrantPos.y * quadrantHalfSize;

                const rotation = Math_radians(quadrantIndex * 90);

                context.save();
                context.translate(centerQuadrantX, centerQuadrantY);
                context.rotate(rotation);

                context.fillStyle = enumColorsToHexCode[color];
                context.strokeStyle = THEME.items.outline;
                context.lineWidth = THEME.items.outlineWidth * Math.pow(0.8, layerIndex);

                const insetPadding = 0.0;

                const dims = quadrantSize * layerScale;
                const innerDims = insetPadding - quadrantHalfSize;
                let began = null;

                function begin(args) {
                    context.save();
                    context.translate(innerDims, -innerDims);
                    context.scale(dims, -dims);
                    if (args.size) {
                        context.scale(args.size, args.size);
                    }
                    if (args.path) {
                        context.beginPath();
                    }
                    if (args.zero) {
                        context.moveTo(0, 0);
                    }
                    began = args;
                }
                function end() {
                    if (!began) {
                        return;
                    }
                    if (began.path) {
                        context.closePath();
                    }
                    context.restore();
                }

                let shape = allShapeData[subShape];
                if (shape.draw) {
                    shape.draw({
                        dims,
                        innerDims,
                        layer: layerIndex,
                        quad: quadrantIndex,
                        context,
                        color,
                        begin,
                    });
                    end();
                }

                context.fill();
                context.stroke();

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
     * Stacks the given shape definition on top.
     * @param {ShapeDefinition} definition
     */
    cloneAndStackWith(definition) {
        const newLayers = this.internalCloneLayers();

        if (this.isEntirelyEmpty() || definition.isEntirelyEmpty()) {
            assert(false, "Can not stack entirely empty definition");
        }

        // Put layer for layer on top
        for (let i = 0; i < definition.layers.length; ++i) {
            const layerToAdd = definition.layers[i];

            // On which layer we can merge this upper layer
            let mergeOnLayerIndex = null;

            // Go from top to bottom and check if there is anything intercepting it
            for (let k = newLayers.length - 1; k >= 0; --k) {
                const lowerLayer = newLayers[k];

                let canMerge = true;
                for (let quadrantIndex = 0; quadrantIndex < 4; ++quadrantIndex) {
                    const upperItem = layerToAdd[quadrantIndex];
                    const lowerItem = lowerLayer[quadrantIndex];

                    if (upperItem && lowerItem) {
                        // so, we can't merge it because two items conflict
                        canMerge = false;
                        break;
                    }
                }

                // If we can merge it, store it - since we go from top to bottom
                // we can simply override it
                if (canMerge) {
                    mergeOnLayerIndex = k;
                }
            }

            if (mergeOnLayerIndex !== null) {
                // Simply merge using an OR mask
                for (let quadrantIndex = 0; quadrantIndex < 4; ++quadrantIndex) {
                    newLayers[mergeOnLayerIndex][quadrantIndex] =
                        newLayers[mergeOnLayerIndex][quadrantIndex] || layerToAdd[quadrantIndex];
                }
            } else {
                // Add new layer
                newLayers.push(layerToAdd);
            }
        }

        newLayers.splice(4);

        return new ShapeDefinition({ layers: newLayers });
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
                    item.color = colors[quadrantIndex];
                }
            }
        }
        return new ShapeDefinition({ layers: newLayers });
    }
}
