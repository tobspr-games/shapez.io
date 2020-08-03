import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Rectangle } from "../../core/rectangle";
import { AtlasSprite } from "../../core/sprites";
import { directionRotationMap, inverseAngleMap, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { getBuildingDataFromCode } from "../building_codes";

/**
 * @typedef {import("../../core/vector").Angle} Angle
 * @typedef {import("../../core/vector").Direction} Direction
 */

export class StaticMapEntityComponent extends Component {
    static getId() {
        return "StaticMapEntity";
    }

    static getSchema() {
        return {
            origin: types.tileVector,
            tileSize: types.tileVector,
            rotation: types.float,
            originalRotation: types.float,

            // See building_codes.js
            code: types.uint,
        };
    }

    /**
     * Returns the sprite
     * @returns {AtlasSprite}
     */
    getSprite() {
        return getBuildingDataFromCode(this.code).sprite;
    }

    /**
     * Returns the blueprint sprite
     * @returns {AtlasSprite}
     */
    getBlueprintSprite() {
        return getBuildingDataFromCode(this.code).blueprintSprite;
    }

    /**
     * Returns the silhouette color
     * @returns {string}
     */
    getSilhouetteColor() {
        return getBuildingDataFromCode(this.code).silhouetteColor;
    }

    duplicateWithoutContents() {
        return new StaticMapEntityComponent({
            origin: this.origin.copy(),
            tileSize: this.tileSize.copy(),
            rotation: this.rotation,
            originalRotation: this.originalRotation,
            code: this.code,
        });
    }

    /**
     *
     * @param {object} param0
     * @param {Vector=} param0.origin Origin (Top Left corner) of the entity
     * @param {Vector=} param0.tileSize Size of the entity in tiles
     * @param {Angle} param0.rotation Rotation in degrees. Must be multiple of 90
     * @param {Angle=} param0.originalRotation Original Rotation in degrees. Must be multiple of 90
     * @param {number=} param0.code Building code
     */
    constructor({
        origin = new Vector(),
        tileSize = new Vector(1, 1),
        rotation = 0,
        originalRotation = 0,
        code = 0,
    }) {
        super();
        assert(
            rotation % 90 === 0,
            "Rotation of static map entity must be multiple of 90 (was " + rotation + ")"
        );

        this.origin = origin;
        this.tileSize = tileSize;
        this.rotation = rotation;
        this.code = code;
        this.originalRotation = originalRotation;
    }

    /**
     * Returns the effective rectangle of this entity in tile space
     * @returns {Rectangle}
     */
    getTileSpaceBounds() {
        switch (this.rotation) {
            case 0:
                return new Rectangle(this.origin.x, this.origin.y, this.tileSize.x, this.tileSize.y);
            case 90:
                return new Rectangle(
                    this.origin.x - this.tileSize.y + 1,
                    this.origin.y,
                    this.tileSize.y,
                    this.tileSize.x
                );
            case 180:
                return new Rectangle(
                    this.origin.x - this.tileSize.x + 1,
                    this.origin.y - this.tileSize.y + 1,
                    this.tileSize.x,
                    this.tileSize.y
                );
            case 270:
                return new Rectangle(
                    this.origin.x,
                    this.origin.y - this.tileSize.x + 1,
                    this.tileSize.y,
                    this.tileSize.x
                );
            default:
                assert(false, "Invalid rotation");
        }
    }

    /**
     * Transforms the given vector/rotation from local space to world space
     * @param {Vector} vector
     * @returns {Vector}
     */
    applyRotationToVector(vector) {
        return vector.rotateFastMultipleOf90(this.rotation);
    }

    /**
     * Transforms the given vector/rotation from world space to local space
     * @param {Vector} vector
     * @returns {Vector}
     */
    unapplyRotationToVector(vector) {
        return vector.rotateFastMultipleOf90(inverseAngleMap[this.rotation]);
    }

    /**
     * Transforms the given direction from local space
     * @param {Direction} direction
     * @returns {Direction}
     */
    localDirectionToWorld(direction) {
        return directionRotationMap[direction][this.rotation];
    }

    /**
     * Transforms the given direction from world to local space
     * @param {Direction} direction
     * @returns {Direction}
     */
    worldDirectionToLocal(direction) {
        return directionRotationMap[direction][inverseAngleMap[this.rotation]];
    }

    /**
     * Transforms from local tile space to global tile space
     * @param {Vector} localTile
     * @returns {Vector}
     */
    localTileToWorld(localTile) {
        const result = this.applyRotationToVector(localTile);
        result.addInplace(this.origin);
        return result;
    }

    /**
     * Transforms from world space to local space
     * @param {Vector} worldTile
     */
    worldToLocalTile(worldTile) {
        const localUnrotated = worldTile.sub(this.origin);
        return this.unapplyRotationToVector(localUnrotated);
    }

    /**
     * Returns whether the entity should be drawn for the given parameters
     * @param {DrawParameters} parameters
     */
    shouldBeDrawn(parameters) {
        let x = 0;
        let y = 0;
        let w = 0;
        let h = 0;

        switch (this.rotation) {
            case 0: {
                x = this.origin.x;
                y = this.origin.y;
                w = this.tileSize.x;
                h = this.tileSize.y;
                break;
            }
            case 90: {
                x = this.origin.x - this.tileSize.y + 1;
                y = this.origin.y;
                w = this.tileSize.y;
                h = this.tileSize.x;
                break;
            }
            case 180: {
                x = this.origin.x - this.tileSize.x + 1;
                y = this.origin.y - this.tileSize.y + 1;
                w = this.tileSize.x;
                h = this.tileSize.y;
                break;
            }
            case 270: {
                x = this.origin.x;
                y = this.origin.y - this.tileSize.x + 1;
                w = this.tileSize.y;
                h = this.tileSize.x;
                break;
            }
            default:
                assert(false, "Invalid rotation");
        }

        return parameters.visibleRect.containsRect4Params(
            x * globalConfig.tileSize,
            y * globalConfig.tileSize,
            w * globalConfig.tileSize,
            h * globalConfig.tileSize
        );
    }

    /**
     * Draws a sprite over the whole space of the entity
     * @param {DrawParameters} parameters
     * @param {AtlasSprite} sprite
     * @param {number=} extrudePixels How many pixels to extrude the sprite
     * @param {boolean=} clipping Whether to clip
     * @param {Vector=} overridePosition Whether to drwa the entity at a different location
     */
    drawSpriteOnFullEntityBounds(
        parameters,
        sprite,
        extrudePixels = 0,
        clipping = true,
        overridePosition = null
    ) {
        if (!this.shouldBeDrawn(parameters) && !overridePosition) {
            return;
        }
        let worldX = this.origin.x * globalConfig.tileSize;
        let worldY = this.origin.y * globalConfig.tileSize;

        if (overridePosition) {
            worldX = overridePosition.x * globalConfig.tileSize;
            worldY = overridePosition.y * globalConfig.tileSize;
        }

        if (this.rotation === 0) {
            // Early out, is faster
            sprite.drawCached(
                parameters,
                worldX - extrudePixels * this.tileSize.x,
                worldY - extrudePixels * this.tileSize.y,
                globalConfig.tileSize * this.tileSize.x + 2 * extrudePixels * this.tileSize.x,
                globalConfig.tileSize * this.tileSize.y + 2 * extrudePixels * this.tileSize.y,
                false
            );
        } else {
            const rotationCenterX = worldX + globalConfig.halfTileSize;
            const rotationCenterY = worldY + globalConfig.halfTileSize;

            parameters.context.translate(rotationCenterX, rotationCenterY);
            parameters.context.rotate(Math.radians(this.rotation));

            sprite.drawCached(
                parameters,
                -globalConfig.halfTileSize - extrudePixels * this.tileSize.x,
                -globalConfig.halfTileSize - extrudePixels * this.tileSize.y,
                globalConfig.tileSize * this.tileSize.x + 2 * extrudePixels * this.tileSize.x,
                globalConfig.tileSize * this.tileSize.y + 2 * extrudePixels * this.tileSize.y,
                false
            );

            parameters.context.rotate(-Math.radians(this.rotation));
            parameters.context.translate(-rotationCenterX, -rotationCenterY);
        }
    }
}
