import { BasicSerializableObject } from "../savegame/serialization";
import { GameRoot } from "./root";
import { ShapeDefinition, enumSubShape } from "./shape_definition";
import { createLogger } from "../core/logging";
import { enumColors } from "./colors";

const logger = createLogger("shape_definition_manager");

export class ShapeDefinitionManager extends BasicSerializableObject {
    static getId() {
        return "ShapeDefinitionManager";
    }

    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        super();
        this.root = root;

        this.shapeKeyToDefinition = {};

        // Caches operations in the form of 'operation:def1[:def2]'
        /** @type {Object.<string, Array<ShapeDefinition>|ShapeDefinition>} */
        this.operationCache = {};
    }

    /**
     *
     * @param {string} hash
     * @returns {ShapeDefinition}
     */
    getShapeFromShortKey(hash) {
        const cached = this.shapeKeyToDefinition[hash];
        if (cached) {
            return cached;
        }
        return (this.shapeKeyToDefinition[hash] = ShapeDefinition.fromShortKey(hash));
    }

    /**
     * Registers a new shape definition
     * @param {ShapeDefinition} definition
     */
    registerShapeDefinition(definition) {
        const id = definition.getHash();
        assert(!this.shapeKeyToDefinition[id], "Shape Definition " + id + " already exists");
        this.shapeKeyToDefinition[id] = definition;
        // logger.log("Registered shape with key", id);
    }

    /**
     * Generates a definition for splitting a shape definition in two halfs
     * @param {ShapeDefinition} definition
     * @returns {[ShapeDefinition, ShapeDefinition]}
     */
    shapeActionCutHalf(definition) {
        const key = "cut:" + definition.getHash();
        if (this.operationCache[key]) {
            return /** @type {[ShapeDefinition, ShapeDefinition]} */ (this.operationCache[key]);
        }
        const rightSide = definition.cloneFilteredByQuadrants([2, 3]);
        const leftSide = definition.cloneFilteredByQuadrants([0, 1]);

        return /** @type {[ShapeDefinition, ShapeDefinition]} */ (this.operationCache[key] = [
            this.registerOrReturnHandle(rightSide),
            this.registerOrReturnHandle(leftSide),
        ]);
    }

    /**
     * Generates a definition for splitting a shape definition in four quads
     * @param {ShapeDefinition} definition
     * @returns {[ShapeDefinition, ShapeDefinition, ShapeDefinition, ShapeDefinition]}
     */
    shapeActionCutQuad(definition) {
        const key = "cut-quad:" + definition.getHash();
        if (this.operationCache[key]) {
            return /** @type {[ShapeDefinition, ShapeDefinition, ShapeDefinition, ShapeDefinition]} */ (this
                .operationCache[key]);
        }

        return /** @type {[ShapeDefinition, ShapeDefinition, ShapeDefinition, ShapeDefinition]} */ (this.operationCache[
            key
        ] = [
            this.registerOrReturnHandle(definition.cloneFilteredByQuadrants([0])),
            this.registerOrReturnHandle(definition.cloneFilteredByQuadrants([1])),
            this.registerOrReturnHandle(definition.cloneFilteredByQuadrants([2])),
            this.registerOrReturnHandle(definition.cloneFilteredByQuadrants([3])),
        ]);
    }

    /**
     * Generates a definition for rotating a shape clockwise
     * @param {ShapeDefinition} definition
     * @returns {ShapeDefinition}
     */
    shapeActionRotateCW(definition) {
        const key = "rotate-cw:" + definition.getHash();
        if (this.operationCache[key]) {
            return /** @type {ShapeDefinition} */ (this.operationCache[key]);
        }

        const rotated = definition.cloneRotateCW();

        return /** @type {ShapeDefinition} */ (this.operationCache[key] = this.registerOrReturnHandle(
            rotated
        ));
    }

    /**
     * Generates a definition for rotating a shape counter clockwise
     * @param {ShapeDefinition} definition
     * @returns {ShapeDefinition}
     */
    shapeActionRotateCCW(definition) {
        const key = "rotate-ccw:" + definition.getHash();
        if (this.operationCache[key]) {
            return /** @type {ShapeDefinition} */ (this.operationCache[key]);
        }

        const rotated = definition.cloneRotateCCW();

        return /** @type {ShapeDefinition} */ (this.operationCache[key] = this.registerOrReturnHandle(
            rotated
        ));
    }

    /**
     * Generates a definition for stacking the upper definition onto the lower one
     * @param {ShapeDefinition} lowerDefinition
     * @param {ShapeDefinition} upperDefinition
     * @returns {ShapeDefinition}
     */
    shapeActionStack(lowerDefinition, upperDefinition) {
        const key = "stack:" + lowerDefinition.getHash() + ":" + upperDefinition.getHash();
        if (this.operationCache[key]) {
            return /** @type {ShapeDefinition} */ (this.operationCache[key]);
        }
        const stacked = lowerDefinition.cloneAndStackWith(upperDefinition);
        return /** @type {ShapeDefinition} */ (this.operationCache[key] = this.registerOrReturnHandle(
            stacked
        ));
    }

    /**
     * Generates a definition for painting it with the given color
     * @param {ShapeDefinition} definition
     * @param {enumColors} color
     * @returns {ShapeDefinition}
     */
    shapeActionPaintWith(definition, color) {
        const key = "paint:" + definition.getHash() + ":" + color;
        if (this.operationCache[key]) {
            return /** @type {ShapeDefinition} */ (this.operationCache[key]);
        }
        const colorized = definition.cloneAndPaintWith(color);
        return /** @type {ShapeDefinition} */ (this.operationCache[key] = this.registerOrReturnHandle(
            colorized
        ));
    }

    /**
     * Generates a definition for inverting all colors on that shape
     * @param {ShapeDefinition} definition
     * @returns {ShapeDefinition}
     */
    shapeActionInvertColors(definition) {
        const key = "invert:" + definition.getHash();
        if (this.operationCache[key]) {
            return /** @type {ShapeDefinition} */ (this.operationCache[key]);
        }
        const inverted = definition.cloneAndInvertColors();
        return /** @type {ShapeDefinition} */ (this.operationCache[key] = this.registerOrReturnHandle(
            inverted
        ));
    }

    /**
     * Generates a definition for painting it with the 4 colors
     * @param {ShapeDefinition} definition
     * @param {[enumColors, enumColors, enumColors, enumColors]} colors
     * @returns {ShapeDefinition}
     */
    shapeActionPaintWith4Colors(definition, colors) {
        const key = "paint4:" + definition.getHash() + ":" + colors.join(",");
        if (this.operationCache[key]) {
            return /** @type {ShapeDefinition} */ (this.operationCache[key]);
        }
        const colorized = definition.cloneAndPaintWith4Colors(colors);
        return /** @type {ShapeDefinition} */ (this.operationCache[key] = this.registerOrReturnHandle(
            colorized
        ));
    }

    /**
     * Checks if we already have cached this definition, and if so throws it away and returns the already
     * cached variant
     * @param {ShapeDefinition} definition
     */
    registerOrReturnHandle(definition) {
        const id = definition.getHash();
        if (this.shapeKeyToDefinition[id]) {
            return this.shapeKeyToDefinition[id];
        }
        this.shapeKeyToDefinition[id] = definition;
        // logger.log("Registered shape with key (2)", id);
        return definition;
    }

    /**
     *
     * @param {[enumSubShape, enumSubShape, enumSubShape, enumSubShape]} subShapes
     * @returns {ShapeDefinition}
     */
    getDefinitionFromSimpleShapes(subShapes, color = enumColors.uncolored) {
        const shapeLayer = /** @type {import("./shape_definition").ShapeLayer} */ (subShapes.map(
            subShape => ({ subShape, color })
        ));

        return this.registerOrReturnHandle(new ShapeDefinition({ layers: [shapeLayer] }));
    }
}
