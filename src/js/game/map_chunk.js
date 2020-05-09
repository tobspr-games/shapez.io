/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { Math_ceil, Math_max, Math_min, Math_random, Math_round } from "../core/builtins";
import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import {
    clamp,
    fastArrayDeleteValueIfContained,
    make2DUndefinedArray,
    randomChoice,
    randomInt,
} from "../core/utils";
import { Vector } from "../core/vector";
import { BaseItem } from "./base_item";
import { enumColors } from "./colors";
import { Entity } from "./entity";
import { ColorItem } from "./items/color_item";
import { ShapeItem } from "./items/shape_item";
import { enumSubShape } from "./shape_definition";

const logger = createLogger("map_chunk");

export class MapChunk {
    /**
     *
     * @param {GameRoot} root
     * @param {number} x
     * @param {number} y
     */
    constructor(root, x, y) {
        this.root = root;
        this.x = x;
        this.y = y;
        this.tileX = x * globalConfig.mapChunkSize;
        this.tileY = y * globalConfig.mapChunkSize;

        /** @type {Array<Array<?Entity>>} */
        this.contents = make2DUndefinedArray(
            globalConfig.mapChunkSize,
            globalConfig.mapChunkSize,
            "map-chunk@" + this.x + "|" + this.y
        );

        /** @type {Array<Array<?BaseItem>>} */
        this.lowerLayer = make2DUndefinedArray(
            globalConfig.mapChunkSize,
            globalConfig.mapChunkSize,
            "map-chunk-lower@" + this.x + "|" + this.y
        );

        /** @type {Array<Entity>} */
        this.containedEntities = [];

        /**
         * Store which patches we have so we can render them in the overview
         * @type {Array<{pos: Vector, item: BaseItem, size: number }>}
         */
        this.patches = [];

        this.generateLowerLayer();
    }

    /**
     * Generates a patch filled with the given item
     * @param {number} patchSize
     * @param {BaseItem} item
     * @param {number=} overrideX Override the X position of the patch
     * @param {number=} overrideY Override the Y position of the patch
     */
    internalGeneratePatch(patchSize, item, overrideX = null, overrideY = null) {
        const border = Math_ceil(patchSize / 2 + 3);

        // Find a position within the chunk which is not blocked
        let patchX = randomInt(border, globalConfig.mapChunkSize - border - 1);
        let patchY = randomInt(border, globalConfig.mapChunkSize - border - 1);

        if (overrideX !== null) {
            patchX = overrideX;
        }

        if (overrideY !== null) {
            patchY = overrideY;
        }

        const avgPos = new Vector(0, 0);
        let patchesDrawn = 0;

        // Each patch consists of multiple circles
        const numCircles = patchSize;
        // const numCircles = 1;

        for (let i = 0; i <= numCircles; ++i) {
            // Determine circle parameters
            const circleRadius = Math_min(1 + i, patchSize);
            const circleRadiusSquare = circleRadius * circleRadius;
            const circleOffsetRadius = (numCircles - i) / 2 + 2;

            // We draw an elipsis actually
            const circleScaleY = 1 + (Math_random() * 2 - 1) * 0.1;
            const circleScaleX = 1 + (Math_random() * 2 - 1) * 0.1;

            const circleX = patchX + randomInt(-circleOffsetRadius, circleOffsetRadius);
            const circleY = patchY + randomInt(-circleOffsetRadius, circleOffsetRadius);

            for (let dx = -circleRadius * circleScaleX - 2; dx <= circleRadius * circleScaleX + 2; ++dx) {
                for (let dy = -circleRadius * circleScaleY - 2; dy <= circleRadius * circleScaleY + 2; ++dy) {
                    const x = Math_round(circleX + dx);
                    const y = Math_round(circleY + dy);
                    if (x >= 0 && x < globalConfig.mapChunkSize && y >= 0 && y <= globalConfig.mapChunkSize) {
                        const originalDx = dx / circleScaleX;
                        const originalDy = dy / circleScaleY;
                        if (originalDx * originalDx + originalDy * originalDy <= circleRadiusSquare) {
                            if (!this.lowerLayer[x][y]) {
                                this.lowerLayer[x][y] = item;
                                ++patchesDrawn;
                                avgPos.x += x;
                                avgPos.y += y;
                            }
                        }
                    } else {
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
     * @param {number} colorPatchSize
     * @param {number} distanceToOriginInChunks
     */
    internalGenerateColorPatch(colorPatchSize, distanceToOriginInChunks) {
        // First, determine available colors
        let availableColors = [enumColors.red, enumColors.green];
        if (distanceToOriginInChunks > 2) {
            availableColors.push(enumColors.blue);
        }
        this.internalGeneratePatch(colorPatchSize, new ColorItem(randomChoice(availableColors)));
    }

    /**
     * Generates a shape patch
     * @param {number} shapePatchSize
     * @param {number} distanceToOriginInChunks
     */
    internalGenerateShapePatch(shapePatchSize, distanceToOriginInChunks) {
        /** @type {[enumSubShape, enumSubShape, enumSubShape, enumSubShape]} */
        let subShapes = null;

        let weights = {};

        if (distanceToOriginInChunks < 3) {
            // In the beginning, there are just circles
            weights = {
                [enumSubShape.circle]: 100,
            };
        } else if (distanceToOriginInChunks < 6) {
            // Later there come rectangles
            if (Math_random() > 0.4) {
                weights = {
                    [enumSubShape.circle]: 100,
                };
            } else {
                weights = {
                    [enumSubShape.rect]: 100,
                };
            }
        } else {
            // Finally there is a mix of everything
            weights = {
                [enumSubShape.rect]: 100,
                [enumSubShape.circle]: Math_round(50 + clamp(distanceToOriginInChunks * 2, 0, 50)),
                [enumSubShape.star]: Math_round(20 + clamp(distanceToOriginInChunks * 2, 0, 30)),
                [enumSubShape.windmill]: Math_round(5 + clamp(distanceToOriginInChunks * 2, 0, 20)),
            };
        }
        subShapes = [
            this.internalGenerateRandomSubShape(weights),
            this.internalGenerateRandomSubShape(weights),
            this.internalGenerateRandomSubShape(weights),
            this.internalGenerateRandomSubShape(weights),
        ];

        const definition = this.root.shapeDefinitionMgr.getDefinitionFromSimpleShapes(subShapes);
        this.internalGeneratePatch(shapePatchSize, new ShapeItem(definition));
    }

    /**
     * Chooses a random shape with the given weights
     * @param {Object.<enumSubShape, number>} weights
     * @returns {enumSubShape}
     */
    internalGenerateRandomSubShape(weights) {
        // @ts-ignore
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);

        const chosenNumber = randomInt(0, sum - 1);
        let accumulated = 0;
        for (const key in weights) {
            const weight = weights[key];
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
    generateLowerLayer() {
        if (this.generatePredefined()) {
            return;
        }

        const chunkCenter = new Vector(this.x, this.y).addScalar(0.5);
        const distanceToOriginInChunks = Math_round(chunkCenter.length());

        // Determine how likely it is that there is a color patch
        const colorPatchChance = 0.9 - clamp(distanceToOriginInChunks / 25, 0, 1) * 0.5;
        if (Math_random() < colorPatchChance) {
            const colorPatchSize = Math_max(2, Math_round(1 + clamp(distanceToOriginInChunks / 8, 0, 4)));
            this.internalGenerateColorPatch(colorPatchSize, distanceToOriginInChunks);
        }

        // Determine how likely it is that there is a shape patch
        const shapePatchChance = 0.9 - clamp(distanceToOriginInChunks / 25, 0, 1) * 0.5;
        if (Math_random() < shapePatchChance) {
            const shapePatchSize = Math_max(2, Math_round(1 + clamp(distanceToOriginInChunks / 8, 0, 4)));
            this.internalGenerateShapePatch(shapePatchSize, distanceToOriginInChunks);
        }
    }

    /**
     * Checks if this chunk has predefined contents, and if so returns true and generates the
     * predefined contents
     * @returns {boolean}
     */
    generatePredefined() {
        if (this.x === 0 && this.y === 0) {
            this.internalGeneratePatch(2, new ColorItem(enumColors.red), 7, 7);
            return true;
        }
        if (this.x === -1 && this.y === 0) {
            const definition = this.root.shapeDefinitionMgr.getDefinitionFromSimpleShapes([
                enumSubShape.circle,
                enumSubShape.circle,
                enumSubShape.circle,
                enumSubShape.circle,
            ]);
            this.internalGeneratePatch(2, new ShapeItem(definition), globalConfig.mapChunkSize - 9, 7);
            return true;
        }
        if (this.x === 0 && this.y === -1) {
            const definition = this.root.shapeDefinitionMgr.getDefinitionFromSimpleShapes([
                enumSubShape.rect,
                enumSubShape.rect,
                enumSubShape.rect,
                enumSubShape.rect,
            ]);
            this.internalGeneratePatch(2, new ShapeItem(definition), 5, globalConfig.mapChunkSize - 7);
            return true;
        }

        if (this.x === -1 && this.y === -1) {
            this.internalGeneratePatch(2, new ColorItem(enumColors.green));
            return true;
        }

        return false;
    }

    /**
     *
     * @param {number} worldX
     * @param {number} worldY
     * @returns {BaseItem=}
     */
    getLowerLayerFromWorldCoords(worldX, worldY) {
        const localX = worldX - this.tileX;
        const localY = worldY - this.tileY;
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");
        return this.lowerLayer[localX][localY] || null;
    }

    /**
     * Returns the contents of this chunk from the given world space coordinates
     * @param {number} worldX
     * @param {number} worldY
     * @returns {Entity=}
     */
    getTileContentFromWorldCoords(worldX, worldY) {
        const localX = worldX - this.tileX;
        const localY = worldY - this.tileY;
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");
        return this.contents[localX][localY] || null;
    }

    /**
     * Returns the chunks contents from the given local coordinates
     * @param {number} localX
     * @param {number} localY
     * @returns {Entity=}
     */
    getTileContentFromLocalCoords(localX, localY) {
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");

        return this.contents[localX][localY] || null;
    }

    /**
     * Sets the chunks contents
     * @param {number} tileX
     * @param {number} tileY
     * @param {Entity=} contents
     */
    setTileContentFromWorldCords(tileX, tileY, contents) {
        const localX = tileX - this.tileX;
        const localY = tileY - this.tileY;
        assert(localX >= 0, "Local X is < 0");
        assert(localY >= 0, "Local Y is < 0");
        assert(localX < globalConfig.mapChunkSize, "Local X is >= chunk size");
        assert(localY < globalConfig.mapChunkSize, "Local Y is >= chunk size");
        const oldContents = this.contents[localX][localY];
        assert(contents === null || !oldContents, "Tile already used: " + tileX + " / " + tileY);

        if (oldContents) {
            // Remove from list
            fastArrayDeleteValueIfContained(this.containedEntities, oldContents);
        }
        this.contents[localX][localY] = contents;
        if (contents) {
            if (this.containedEntities.indexOf(contents) < 0) {
                this.containedEntities.push(contents);
            }
        }
    }
}
