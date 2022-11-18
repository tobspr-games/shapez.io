import { createLogger } from "../core/logging";
import { BasicSerializableObject } from "../savegame/serialization";
import { enumColors } from "./colors";
import { ShapeItem } from "./items/shape_item";
import { GameRoot } from "./root";
import { enumSubShape, ShapeDefinition } from "./shape_definition";
import { ACHIEVEMENTS } from "../platform/achievement_provider";
const logger: any = createLogger("shape_definition_manager");
export class ShapeDefinitionManager extends BasicSerializableObject {
    static getId(): any {
        return "ShapeDefinitionManager";
    }
    public root = root;
    public shapeKeyToDefinition: {
        [idx: string]: ShapeDefinition;
    } = {};
    public shapeKeyToItem = {};
    public operationCache: {
        [idx: string]: Array<ShapeDefinition> | ShapeDefinition;
    } = {};

        constructor(root) {
        super();
    }
    /**
     * Returns a shape instance from a given short key
     * {}
     */
    getShapeFromShortKey(hash: string): ShapeDefinition {
        const cached: any = this.shapeKeyToDefinition[hash];
        if (cached) {
            return cached;
        }
        return (this.shapeKeyToDefinition[hash] = ShapeDefinition.fromShortKey(hash));
    }
    /**
     * Returns a item instance from a given short key
     * {}
     */
    getShapeItemFromShortKey(hash: string): ShapeItem {
        const cached: any = this.shapeKeyToItem[hash];
        if (cached) {
            return cached;
        }
        const definition: any = this.getShapeFromShortKey(hash);
        return (this.shapeKeyToItem[hash] = new ShapeItem(definition));
    }
    /**
     * Returns a shape item for a given definition
     * {}
     */
    getShapeItemFromDefinition(definition: ShapeDefinition): ShapeItem {
        return this.getShapeItemFromShortKey(definition.getHash());
    }
    /**
     * Registers a new shape definition
     */
    registerShapeDefinition(definition: ShapeDefinition): any {
        const id: any = definition.getHash();
        assert(!this.shapeKeyToDefinition[id], "Shape Definition " + id + " already exists");
        this.shapeKeyToDefinition[id] = definition;
        // logger.log("Registered shape with key", id);
    }
    /**
     * Generates a definition for splitting a shape definition in two halfs
     * {}
     */
    shapeActionCutHalf(definition: ShapeDefinition): [
        ShapeDefinition,
        ShapeDefinition
    ] {
        const key: any = "cut/" + definition.getHash();
        if (this.operationCache[key]) {
            return this.operationCache[key] as [
                ShapeDefinition,
                ShapeDefinition
            ]);
        }
        const rightSide: any = definition.cloneFilteredByQuadrants([2, 3]);
        const leftSide: any = definition.cloneFilteredByQuadrants([0, 1]);
        this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.cutShape, null);
        return this.operationCache[key] = [
            this.registerOrReturnHandle(rightSide),
            this.registerOrReturnHandle(leftSide),
        ] as [
            ShapeDefinition,
            ShapeDefinition
        ]);
    }
    /**
     * Generates a definition for splitting a shape definition in four quads
     * {}
     */
    shapeActionCutQuad(definition: ShapeDefinition): [
        ShapeDefinition,
        ShapeDefinition,
        ShapeDefinition,
        ShapeDefinition
    ] {
        const key: any = "cut-quad/" + definition.getHash();
        if (this.operationCache[key]) {
            return this
                .operationCache[key] as [
                ShapeDefinition,
                ShapeDefinition,
                ShapeDefinition,
                ShapeDefinition
            ]);
        }
        return this.operationCache[key] = [
            this.registerOrReturnHandle(definition.cloneFilteredByQuadrants([0])),
            this.registerOrReturnHandle(definition.cloneFilteredByQuadrants([1])),
            this.registerOrReturnHandle(definition.cloneFilteredByQuadrants([2])),
            this.registerOrReturnHandle(definition.cloneFilteredByQuadrants([3])),
        ] as [
            ShapeDefinition,
            ShapeDefinition,
            ShapeDefinition,
            ShapeDefinition
        ]);
    }
    /**
     * Generates a definition for rotating a shape clockwise
     * {}
     */
    shapeActionRotateCW(definition: ShapeDefinition): ShapeDefinition {
        const key: any = "rotate-cw/" + definition.getHash();
        if (this.operationCache[key]) {
            return this.operationCache[key] as ShapeDefinition);
        }
        const rotated: any = definition.cloneRotateCW();
        this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.rotateShape, null);
        return this.operationCache[key] = this.registerOrReturnHandle(rotated) as ShapeDefinition);
    }
    /**
     * Generates a definition for rotating a shape counter clockwise
     * {}
     */
    shapeActionRotateCCW(definition: ShapeDefinition): ShapeDefinition {
        const key: any = "rotate-ccw/" + definition.getHash();
        if (this.operationCache[key]) {
            return this.operationCache[key] as ShapeDefinition);
        }
        const rotated: any = definition.cloneRotateCCW();
        return this.operationCache[key] = this.registerOrReturnHandle(rotated) as ShapeDefinition);
    }
    /**
     * Generates a definition for rotating a shape FL
     * {}
     */
    shapeActionRotate180(definition: ShapeDefinition): ShapeDefinition {
        const key: any = "rotate-fl/" + definition.getHash();
        if (this.operationCache[key]) {
            return this.operationCache[key] as ShapeDefinition);
        }
        const rotated: any = definition.cloneRotate180();
        return this.operationCache[key] = this.registerOrReturnHandle(rotated) as ShapeDefinition);
    }
    /**
     * Generates a definition for stacking the upper definition onto the lower one
     * {}
     */
    shapeActionStack(lowerDefinition: ShapeDefinition, upperDefinition: ShapeDefinition): ShapeDefinition {
        const key: any = "stack/" + lowerDefinition.getHash() + "/" + upperDefinition.getHash();
        if (this.operationCache[key]) {
            return this.operationCache[key] as ShapeDefinition);
        }
        this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.stackShape, null);
        const stacked: any = lowerDefinition.cloneAndStackWith(upperDefinition);
        return this.operationCache[key] = this.registerOrReturnHandle(stacked) as ShapeDefinition);
    }
    /**
     * Generates a definition for painting it with the given color
     * {}
     */
    shapeActionPaintWith(definition: ShapeDefinition, color: enumColors): ShapeDefinition {
        const key: any = "paint/" + definition.getHash() + "/" + color;
        if (this.operationCache[key]) {
            return this.operationCache[key] as ShapeDefinition);
        }
        this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.paintShape, null);
        const colorized: any = definition.cloneAndPaintWith(color);
        return this.operationCache[key] = this.registerOrReturnHandle(colorized) as ShapeDefinition);
    }
    /**
     * Generates a definition for painting it with the 4 colors
     * {}
     */
    shapeActionPaintWith4Colors(definition: ShapeDefinition, colors: [
        enumColors,
        enumColors,
        enumColors,
        enumColors
    ]): ShapeDefinition {
        const key: any = "paint4/" + definition.getHash() + "/" + colors.join(",");
        if (this.operationCache[key]) {
            return this.operationCache[key] as ShapeDefinition);
        }
        const colorized: any = definition.cloneAndPaintWith4Colors(colors);
        return this.operationCache[key] = this.registerOrReturnHandle(colorized) as ShapeDefinition);
    }
    /**
     * Checks if we already have cached this definition, and if so throws it away and returns the already
     * cached variant
     */
    registerOrReturnHandle(definition: ShapeDefinition): any {
        const id: any = definition.getHash();
        if (this.shapeKeyToDefinition[id]) {
            return this.shapeKeyToDefinition[id];
        }
        this.shapeKeyToDefinition[id] = definition;
        // logger.log("Registered shape with key (2)", id);
        return definition;
    }
    /**
     *
     * {}
     */
    getDefinitionFromSimpleShapes(subShapes: [
        enumSubShape,
        enumSubShape,
        enumSubShape,
        enumSubShape
    ], color: any = enumColors.uncolored): ShapeDefinition {
        const shapeLayer: any = (subShapes.map((subShape: any): any => ({ subShape, color })) as import("./shape_definition").ShapeLayer);
        return this.registerOrReturnHandle(new ShapeDefinition({ layers: [shapeLayer] }));
    }
}
