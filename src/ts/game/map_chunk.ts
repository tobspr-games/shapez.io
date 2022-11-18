import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { RandomNumberGenerator } from "../core/rng";
import { clamp, fastArrayDeleteValueIfContained, make2DUndefinedArray } from "../core/utils";
import { Vector } from "../core/vector";
import { BaseItem } from "./base_item";
import { enumColors } from "./colors";
import { Entity } from "./entity";
import { COLOR_ITEM_SINGLETONS } from "./items/color_item";
import { GameRoot } from "./root";
import { enumSubShape } from "./shape_definition";
import { Rectangle } from "../core/rectangle";
const logger: any = createLogger("map_chunk");
export const MODS_ADDITIONAL_SHAPE_MAP_WEIGHTS: {
    [idx: string]: (distanceToOriginInChunks: number) => number;
} = {};
export class MapChunk {
    public root = root;
    public x = x;
    public y = y;
    public tileX = x * globalConfig.mapChunkSize;
    public tileY = y * globalConfig.mapChunkSize;
    public lowerLayer: Array<Array<?BaseItem>> = make2DUndefinedArray(globalConfig.mapChunkSize, globalConfig.mapChunkSize);
    public contents: Array<Array<?Entity>> = make2DUndefinedArray(globalConfig.mapChunkSize, globalConfig.mapChunkSize);
    public wireContents: Array<Array<?Entity>> = make2DUndefinedArray(globalConfig.mapChunkSize, globalConfig.mapChunkSize);
    public containedEntities: Array<Entity> = [];
    public worldSpaceRectangle = new Rectangle(this.tileX * globalConfig.tileSize, this.tileY * globalConfig.tileSize, globalConfig.mapChunkWorldSize, globalConfig.mapChunkWorldSize);
    public tileSpaceRectangle = new Rectangle(this.tileX, this.tileY, globalConfig.mapChunkSize, globalConfig.mapChunkSize);
    public containedEntitiesByLayer: Record<Layer, Array<Entity>> = {
        regular: [],
        wires: [],
    };
    public patches: Array<{
        pos: Vector;
        item: BaseItem;
        size: number;
    }> = [];

        constructor(root, x, y) {
        this.generateLowerLayer();
    }
    /**
     * Generates a patch filled with the given item
     */
    internalGeneratePatch(rng: RandomNumberGenerator, patchSize: number, item: BaseItem, overrideX: number= = null, overrideY: number= = null): any {
        const border: any = Math.ceil(patchSize / 2 + 3);
        // Find a position within the chunk which is not blocked
        let patchX: any = rng.nextIntRange(border, globalConfig.mapChunkSize - border - 1);
        let patchY: any = rng.nextIntRange(border, globalConfig.mapChunkSize - border - 1);
        if (overrideX !== null) {
            patchX = overrideX;
        }
        if (overrideY !== null) {
            patchY = overrideY;
        }
        const avgPos: any = new Vector(0, 0);
        let patchesDrawn: any = 0;
        // Each patch consists of multiple circles
        const numCircles: any = patchSize;
        for (let i: any = 0; i <= numCircles; ++i) {
            // Determine circle parameters
            const circleRadius: any = Math.min(1 + i, patchSize);
            const circleRadiusSquare: any = circleRadius * circleRadius;
            const circleOffsetRadius: any = (numCircles - i) / 2 + 2;
            // We draw an elipsis actually
            const circleScaleX: any = rng.nextRange(0.9, 1.1);
            const circleScaleY: any = rng.nextRange(0.9, 1.1);
            const circleX: any = patchX + rng.nextIntRange(-circleOffsetRadius, circleOffsetRadius);
            const circleY: any = patchY + rng.nextIntRange(-circleOffsetRadius, circleOffsetRadius);
            for (let dx: any = -circleRadius * circleScaleX - 2; dx <= circleRadius * circleScaleX + 2; ++dx) {
                for (let dy: any = -circleRadius * circleScaleY - 2; dy <= circleRadius * circleScaleY + 2; ++dy) {
                    const x: any = Math.round(circleX + dx);
                    const y: any = Math.round(circleY + dy);
                    if (x >= 0 && x < globalConfig.mapChunkSize && y >= 0 && y <= globalConfig.mapChunkSize) {
                        const originalDx: any = dx / circleScaleX;
                        const originalDy: any = dy / circleScaleY;
                        if (originalDx * originalDx + originalDy * originalDy <= circleRadiusSquare) {
                            if (!this.lowerLayer[x][y]) {
                                this.lowerLayer[x][y] = item;
                                ++patchesDrawn;
                                avgPos.x += x;
                                avgPos.y += y;
                            }
                        }
                    }
                    else {
                        // logger.warn("Tried to spawn resource out of chunk");
                    }
                }
            }
        }
        this.patches.push({
            pos: avgPos.divideScalar(patchesDrawn),
            item,
            size: patchSize,
        });
    }
    /**
     * Generates a color patch
     */
    internalGenerateColorPatch(rng: RandomNumberGenerator, colorPatchSize: number, distanceToOriginInChunks: number): any {
        // First, determine available colors
        let availableColors: any = [enumColors.red, enumColors.green];
        if (distanceToOriginInChunks > 2) {
            availableColors.push(enumColors.blue);
        }
        this.internalGeneratePatch(rng, colorPatchSize, COLOR_ITEM_SINGLETONS[rng.choice(availableColors)]);
    }
    /**
     * Generates a shape patch
     */
    internalGenerateShapePatch(rng: RandomNumberGenerator, shapePatchSize: number, distanceToOriginInChunks: number): any {
                let subShapes: [
            enumSubShape,
            enumSubShape,
            enumSubShape,
            enumSubShape
        ] = null;
        let weights: any = {};
        // Later there is a mix of everything
        weights = {
            [enumSubShape.rect]: 100,
            [enumSubShape.circle]: Math.round(50 + clamp(distanceToOriginInChunks * 2, 0, 50)),
            [enumSubShape.star]: Math.round(20 + clamp(distanceToOriginInChunks, 0, 30)),
            [enumSubShape.windmill]: Math.round(6 + clamp(distanceToOriginInChunks / 2, 0, 20)),
        };
        for (const key: any in MODS_ADDITIONAL_SHAPE_MAP_WEIGHTS) {
            weights[key] = MODS_ADDITIONAL_SHAPE_MAP_WEIGHTS[key](distanceToOriginInChunks);
        }
        if (distanceToOriginInChunks < 7) {
            // Initial chunks can not spawn the good stuff
            weights[enumSubShape.star] = 0;
            weights[enumSubShape.windmill] = 0;
        }
        if (distanceToOriginInChunks < 10) {
            // Initial chunk patches always have the same shape
            const subShape: any = this.internalGenerateRandomSubShape(rng, weights);
            subShapes = [subShape, subShape, subShape, subShape];
        }
        else if (distanceToOriginInChunks < 15) {
            // Later patches can also have mixed ones
            const subShapeA: any = this.internalGenerateRandomSubShape(rng, weights);
            const subShapeB: any = this.internalGenerateRandomSubShape(rng, weights);
            subShapes = [subShapeA, subShapeA, subShapeB, subShapeB];
        }
        else {
            // Finally there is a mix of everything
            subShapes = [
                this.internalGenerateRandomSubShape(rng, weights),
                this.internalGenerateRandomSubShape(rng, weights),
                this.internalGenerateRandomSubShape(rng, weights),
                this.internalGenerateRandomSubShape(rng, weights),
            ];
        }
        // Makes sure windmills never spawn as whole
        let windmillCount: any = 0;
        for (let i: any = 0; i < subShapes.length; ++i) {
            if (subShapes[i] === enumSubShape.windmill) {
                ++windmillCount;
            }
        }
        if (windmillCount > 1) {
            subShapes[0] = enumSubShape.rect;
            subShapes[1] = enumSubShape.rect;
        }
        const definition: any = this.root.shapeDefinitionMgr.getDefinitionFromSimpleShapes(subShapes);
        this.internalGeneratePatch(rng, shapePatchSize, this.root.shapeDefinitionMgr.getShapeItemFromDefinition(definition));
    }
    /**
     * Chooses a random shape with the given weights
     * {}
     */
    internalGenerateRandomSubShape(rng: RandomNumberGenerator, weights: {
        [idx: enumSubShape]: number;
    }): enumSubShape {
        // @ts-ignore
        const sum: any = Object.values(weights).reduce((a: any, b: any): any => a + b, 0);
        const chosenNumber: any = rng.nextIntRange(0, sum - 1);
        let accumulated: any = 0;
        for (const key: any in weights) {
            const weight: any = weights[key];
            if (accumulated + weight > chosenNumber) {
                return key;
            }
            accumulated += weight;
        }
        logger.error("Failed to find matching shape in chunk generation");
        return enumSubShape.circle;
    }
    /**
     * Generates the lower layer "terrain"
     */
    generateLowerLayer(): any {
        const rng: any = new RandomNumberGenerator(this.x + "|" + this.y + "|" + this.root.map.seed);
        if (this.generatePredefined(rng)) {
            return;
        }
        const chunkCenter: any = new Vector(this.x, this.y).addScalar(0.5);
        const distanceToOriginInChunks: any = Math.round(chunkCenter.length());
        this.generatePatches({ rng, chunkCenter, distanceToOriginInChunks });
    }
        generatePatches({ rng, chunkCenter, distanceToOriginInChunks }: {
        rng: RandomNumberGenerator;
        chunkCenter: Vector;
        distanceToOriginInChunks: number;
    }): any {
        // Determine how likely it is that there is a color patch
        const colorPatchChance: any = 0.9 - clamp(distanceToOriginInChunks / 25, 0, 1) * 0.5;
        if (rng.next() < colorPatchChance / 4) {
            const colorPatchSize: any = Math.max(2, Math.round(1 + clamp(distanceToOriginInChunks / 8, 0, 4)));
            this.internalGenerateColorPatch(rng, colorPatchSize, distanceToOriginInChunks);
        }
        // Determine how likely it is that there is a shape patch
        const shapePatchChance: any = 0.9 - clamp(distanceToOriginInChunks / 25, 0, 1) * 0.5;
        if (rng.next() < shapePatchChance / 4) {
            const shapePatchSize: any = Math.max(2, Math.round(1 + clamp(distanceToOriginInChunks / 8, 0, 4)));
            this.internalGenerateShapePatch(rng, shapePatchSize, distanceToOriginInChunks);
        }
    }
    /**
     * Checks if this chunk has predefined contents, and if so returns true and generates the
     * predefined contents
     * {}
     */
    generatePredefined(rng: RandomNumberGenerator): boolean {
        if (this.x === 0 && this.y === 0) {
            this.internalGeneratePatch(rng, 2, COLOR_ITEM_SINGLETONS[enumColors.red], 7, 7);
            return true;
        }
        if (this.x === -1 && this.y === 0) {
            const item: any = this.root.shapeDefinitionMgr.getShapeItemFromShortKey("CuCuCuCu");
            this.internalGeneratePatch(rng, 2, item, globalConfig.mapChunkSize - 9, 7);
            return true;
        }
        if (this.x === 0 && this.y === -1) {
            const item: any = this.root.shapeDefinitionMgr.getShapeItemFromShortKey("RuRuRuRu");
            this.internalGeneratePatch(rng, 2, item, 5, globalConfig.mapChunkSize - 7);
            return true;
        }
        if (this.x === -1 && this.y === -1) {
            this.internalGeneratePatch(rng, 2, COLOR_ITEM_SINGLETONS[enumColors.green]);
            return true;
        }
        if (this.x === 5 && this.y === -2) {
            const item: any = this.root.shapeDefinitionMgr.getShapeItemFromShortKey("SuSuSuSu");
            this.internalGeneratePatch(rng, 2, item, 5, globalConfig.mapChunkSize - 7);
            return true;
        }
        return false;
    }
    /**
     *
     * {}
     */
    getLowerLayerFromWorldCoords(worldX: number, worldY: number): BaseItem= {
        const localX: any = worldX - this.tileX;
        const localY: any = worldY - this.tileY;
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");
        return this.lowerLayer[localX][localY] || null;
    }
    /**
     * Returns the contents of this chunk from the given world space coordinates
     * {}
     */
    getTileContentFromWorldCoords(worldX: number, worldY: number): Entity= {
        const localX: any = worldX - this.tileX;
        const localY: any = worldY - this.tileY;
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");
        return this.contents[localX][localY] || null;
    }
    /**
     * Returns the contents of this chunk from the given world space coordinates
     * {}
     */
    getLayerContentFromWorldCoords(worldX: number, worldY: number, layer: Layer): Entity= {
        const localX: any = worldX - this.tileX;
        const localY: any = worldY - this.tileY;
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");
        if (layer === "regular") {
            return this.contents[localX][localY] || null;
        }
        else {
            return this.wireContents[localX][localY] || null;
        }
    }
    /**
     * Returns the contents of this chunk from the given world space coordinates
     * {}
     */
    getLayersContentsMultipleFromWorldCoords(worldX: number, worldY: number): Array<Entity> {
        const localX: any = worldX - this.tileX;
        const localY: any = worldY - this.tileY;
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");
        const regularContent: any = this.contents[localX][localY];
        const wireContent: any = this.wireContents[localX][localY];
        const result: any = [];
        if (regularContent) {
            result.push(regularContent);
        }
        if (wireContent) {
            result.push(wireContent);
        }
        return result;
    }
    /**
     * Returns the chunks contents from the given local coordinates
     * {}
     */
    getTileContentFromLocalCoords(localX: number, localY: number): Entity= {
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");
        return this.contents[localX][localY] || null;
    }
    /**
     * Sets the chunks contents
     */
    setLayerContentFromWorldCords(tileX: number, tileY: number, contents: Entity, layer: Layer): any {
        const localX: any = tileX - this.tileX;
        const localY: any = tileY - this.tileY;
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");
        let oldContents: any;
        if (layer === "regular") {
            oldContents = this.contents[localX][localY];
        }
        else {
            oldContents = this.wireContents[localX][localY];
        }
        assert(contents === null || !oldContents, "Tile already used: " + tileX + " / " + tileY);
        if (oldContents) {
            // Remove from list (the old contents must be reigstered)
            fastArrayDeleteValueIfContained(this.containedEntities, oldContents);
            fastArrayDeleteValueIfContained(this.containedEntitiesByLayer[layer], oldContents);
        }
        if (layer === "regular") {
            this.contents[localX][localY] = contents;
        }
        else {
            this.wireContents[localX][localY] = contents;
        }
        if (contents) {
            if (this.containedEntities.indexOf(contents) < 0) {
                this.containedEntities.push(contents);
            }
            if (this.containedEntitiesByLayer[layer].indexOf(contents) < 0) {
                this.containedEntitiesByLayer[layer].push(contents);
            }
        }
    }
}
