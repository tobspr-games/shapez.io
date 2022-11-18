import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Rectangle } from "../../core/rectangle";
import { AtlasSprite } from "../../core/sprites";
import { enumDirection, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { getBuildingDataFromCode } from "../building_codes";
import { Component } from "../component";
export class StaticMapEntityComponent extends Component {
    static getId() {
        return "StaticMapEntity";
    }
    static getSchema() {
        return {
            origin: types.tileVector,
            rotation: types.float,
            originalRotation: types.float,
            // See building_codes.js
            code: types.uintOrString,
        };
    }
    /**
     * Returns the effective tile size
     * {}
     */
    getTileSize(): Vector {
        return getBuildingDataFromCode(this.code).tileSize;
    }
    /**
     * Returns the sprite
     * {}
     */
    getSprite(): AtlasSprite {
        return getBuildingDataFromCode(this.code).sprite;
    }
    /**
     * Returns the blueprint sprite
     * {}
     */
    getBlueprintSprite(): AtlasSprite {
        return getBuildingDataFromCode(this.code).blueprintSprite;
    }
    /**
     * Returns the silhouette color
     * {}
     */
    getSilhouetteColor(): string {
        return getBuildingDataFromCode(this.code).silhouetteColor;
    }
    /**
     * Returns the meta building
     * {}
     */
    getMetaBuilding(): import("../meta_building").MetaBuilding {
        return getBuildingDataFromCode(this.code).metaInstance;
    }
    /**
     * Returns the buildings variant
     * {}
     */
    getVariant(): string {
        return getBuildingDataFromCode(this.code).variant;
    }
    /**
     * Returns the buildings rotation variant
     * {}
     */
    getRotationVariant(): number {
        return getBuildingDataFromCode(this.code).rotationVariant;
    }
    /**
     * Copy the current state to another component
     */
    copyAdditionalStateTo(otherComponent: Component) {
        return new StaticMapEntityComponent({
            origin: this.origin.copy(),
            rotation: this.rotation,
            originalRotation: this.originalRotation,
            code: this.code,
        });
    }
    public origin = origin;
    public rotation = rotation;
    public code = code;
    public originalRotation = originalRotation;

        constructor({ origin = new Vector(), tileSize = new Vector(1, 1), rotation = 0, originalRotation = 0, code = 0, }) {
        super();
        assert(rotation % 90 === 0, "Rotation of static map entity must be multiple of 90 (was " + rotation + ")");
    }
    /**
     * Returns the effective rectangle of this entity in tile space
     * {}
     */
    getTileSpaceBounds(): Rectangle {
        const size = this.getTileSize();
        switch (this.rotation) {
            case 0:
                return new Rectangle(this.origin.x, this.origin.y, size.x, size.y);
            case 90:
                return new Rectangle(this.origin.x - size.y + 1, this.origin.y, size.y, size.x);
            case 180:
                return new Rectangle(this.origin.x - size.x + 1, this.origin.y - size.y + 1, size.x, size.y);
            case 270:
                return new Rectangle(this.origin.x, this.origin.y - size.x + 1, size.y, size.x);
            default:
                assert(false, "Invalid rotation");
        }
    }
    /**
     * Transforms the given vector/rotation from local space to world space
     * {}
     */
    applyRotationToVector(vector: Vector): Vector {
        return vector.rotateFastMultipleOf90(this.rotation);
    }
    /**
     * Transforms the given vector/rotation from world space to local space
     * {}
     */
    unapplyRotationToVector(vector: Vector): Vector {
        return vector.rotateFastMultipleOf90(360 - this.rotation);
    }
    /**
     * Transforms the given direction from local space
     * {}
     */
    localDirectionToWorld(direction: enumDirection): enumDirection {
        return Vector.transformDirectionFromMultipleOf90(direction, this.rotation);
    }
    /**
     * Transforms the given direction from world to local space
     * {}
     */
    worldDirectionToLocal(direction: enumDirection): enumDirection {
        return Vector.transformDirectionFromMultipleOf90(direction, 360 - this.rotation);
    }
    /**
     * Transforms from local tile space to global tile space
     * {}
     */
    localTileToWorld(localTile: Vector): Vector {
        const result = localTile.rotateFastMultipleOf90(this.rotation);
        result.x += this.origin.x;
        result.y += this.origin.y;
        return result;
    }
    /**
     * Transforms from world space to local space
     */
    worldToLocalTile(worldTile: Vector) {
        const localUnrotated = worldTile.sub(this.origin);
        return this.unapplyRotationToVector(localUnrotated);
    }
    /**
     * Returns whether the entity should be drawn for the given parameters
     */
    shouldBeDrawn(parameters: DrawParameters) {
        let x = 0;
        let y = 0;
        let w = 0;
        let h = 0;
        const size = this.getTileSize();
        switch (this.rotation) {
            case 0: {
                x = this.origin.x;
                y = this.origin.y;
                w = size.x;
                h = size.y;
                break;
            }
            case 90: {
                x = this.origin.x - size.y + 1;
                y = this.origin.y;
                w = size.y;
                h = size.x;
                break;
            }
            case 180: {
                x = this.origin.x - size.x + 1;
                y = this.origin.y - size.y + 1;
                w = size.x;
                h = size.y;
                break;
            }
            case 270: {
                x = this.origin.x;
                y = this.origin.y - size.x + 1;
                w = size.y;
                h = size.x;
                break;
            }
            default:
                assert(false, "Invalid rotation");
        }
        return parameters.visibleRect.containsRect4Params(x * globalConfig.tileSize, y * globalConfig.tileSize, w * globalConfig.tileSize, h * globalConfig.tileSize);
    }
    /**
     * Draws a sprite over the whole space of the entity
     */
    drawSpriteOnBoundsClipped(parameters: DrawParameters, sprite: AtlasSprite, extrudePixels: number= = 0, overridePosition: Vector= = null) {
        if (!this.shouldBeDrawn(parameters) && !overridePosition) {
            return;
        }
        const size = this.getTileSize();
        let worldX = this.origin.x * globalConfig.tileSize;
        let worldY = this.origin.y * globalConfig.tileSize;
        if (overridePosition) {
            worldX = overridePosition.x * globalConfig.tileSize;
            worldY = overridePosition.y * globalConfig.tileSize;
        }
        if (this.rotation === 0) {
            // Early out, is faster
            sprite.drawCached(parameters, worldX - extrudePixels * size.x, worldY - extrudePixels * size.y, globalConfig.tileSize * size.x + 2 * extrudePixels * size.x, globalConfig.tileSize * size.y + 2 * extrudePixels * size.y);
        }
        else {
            const rotationCenterX = worldX + globalConfig.halfTileSize;
            const rotationCenterY = worldY + globalConfig.halfTileSize;
            parameters.context.translate(rotationCenterX, rotationCenterY);
            parameters.context.rotate(Math.radians(this.rotation));
            sprite.drawCached(parameters, -globalConfig.halfTileSize - extrudePixels * size.x, -globalConfig.halfTileSize - extrudePixels * size.y, globalConfig.tileSize * size.x + 2 * extrudePixels * size.x, globalConfig.tileSize * size.y + 2 * extrudePixels * size.y, false // no clipping possible here
            );
            parameters.context.rotate(-Math.radians(this.rotation));
            parameters.context.translate(-rotationCenterX, -rotationCenterY);
        }
    }
}
