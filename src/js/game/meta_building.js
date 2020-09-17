import { Loader } from "../core/loader";
import { AtlasSprite } from "../core/sprites";
import { Vector } from "../core/vector";
import { SOUNDS } from "../platform/sound";
import { StaticMapEntityComponent } from "./components/static_map_entity";
import { Entity } from "./entity";
import { GameRoot } from "./root";
import { getCodeFromBuildingData } from "./building_codes";

export const defaultBuildingVariant = "default";

export class MetaBuilding {
    /**
     *
     * @param {string} id Building id
     */
    constructor(id) {
        this.id = id;
    }

    /**
     * Returns the id of this building
     */
    getId() {
        return this.id;
    }

    /**
     * Returns the edit layer of the building
     * @returns {Layer}
     */
    getLayer() {
        return "regular";
    }

    /**
     * Returns whether the building has the direction lock switch available
     */
    getHasDirectionLockAvailable() {
        return false;
    }

    /**
     * Whether to stay in placement mode after having placed a building
     */
    getStayInPlacementMode() {
        return false;
    }

    /**
     * Returns whether this building can get replaced
     */
    getIsReplaceable() {
        return false;
    }

    /**
     * Whether to flip the orientation after a building has been placed - useful
     * for tunnels.
     */
    getFlipOrientationAfterPlacement() {
        return false;
    }

    /**
     * Whether to show a preview of the wires layer when placing the building
     */
    getShowWiresLayerPreview() {
        return false;
    }

    /**
     * Returns whether this building is removable
     * @returns {boolean}
     */
    getIsRemovable() {
        return true;
    }

    /**
     * Returns the placement sound
     * @returns {string}
     */
    getPlacementSound() {
        return SOUNDS.placeBuilding;
    }

    /**
     * @param {GameRoot} root
     * @returns {typeof MetaBuildingVariant}
     */
    getDefaultVariant(root) {
        return this.getAvailableVariants(root)[0];
    }

    /**
     * @param {GameRoot} root
     * @returns {Array<typeof MetaBuildingVariant>}
     */
    getAvailableVariants(root) {
        abstract;
        return [];
    }

    /**
     * Returns whether this building is unlocked for the given game
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return true;
    }

    /**
     * Should return a silhouette color for the map overview or null if not set
     */
    getSilhouetteColor() {
        return null;
    }

    /**
     * Should return false if the pins are already included in the sprite of the building
     * @returns {boolean}
     */
    getRenderPins() {
        return true;
    }

    /**
     * Creates the entity without placing it
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.origin Origin tile
     * @param {number=} param0.rotation Rotation
     * @param {number} param0.originalRotation Original Rotation
     * @param {number} param0.rotationVariant Rotation variant
     * @param {typeof MetaBuildingVariant} param0.variant
     */
    createEntity({ root, origin, rotation, originalRotation, rotationVariant, variant }) {
        const entity = new Entity(root);
        entity.layer = this.getLayer();
        entity.addComponent(
            new StaticMapEntityComponent({
                origin: new Vector(origin.x, origin.y),
                rotation,
                originalRotation,
                tileSize: variant.getDimensions().copy(),
                code: getCodeFromBuildingData(this, variant, rotationVariant),
            })
        );
        this.setupEntityComponents(entity, root);
        variant.updateEntityComponents(entity, rotationVariant, root);
        return entity;
    }

    // PRIVATE INTERFACE

    /**
     * Should setup the entity components
     * @param {Entity} entity
     * @param {GameRoot} root
     */
    setupEntityComponents(entity, root) {
        abstract;
    }
}

export class MetaBuildingVariant {
    static toString() {
        return this.getId();
    }

    /**
     * @returns {string} Variant id
     */
    static getId() {
        abstract;
        return "";
    }

    /**
     * Should update the entity components
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {GameRoot} root
     */
    static updateEntityComponents(entity, rotationVariant, root) {}

    /**
     * Returns whether this building is rotateable
     * @returns {boolean}
     */
    static getIsRotateable() {
        return true;
    }

    /**
     * Should compute the optimal rotation variant on the given tile
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.tile
     * @param {number} param0.rotation
     * @param {Layer} param0.layer
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    static computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, layer }) {
        if (!this.getIsRotateable()) {
            return {
                rotation: 0,
                rotationVariant: 0,
            };
        }
        return {
            rotation,
            rotationVariant: 0,
        };
    }

    /**
     * Can return a special interlaved 9 elements overlay matrix for rendering
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    static getSpecialOverlayRenderMatrix(rotation, rotationVariant, entity) {
        return null;
    }

    /**
     * Should return additional statistics about this building
     * @param {GameRoot} root
     * @returns {Array<[string, string]>}
     */
    static getAdditionalStatistics(root) {
        return [];
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {MetaBuilding} building
     * @returns {AtlasSprite}
     */
    static getSprite(rotationVariant, building) {
        return Loader.getSprite(
            "sprites/buildings/" +
                building.id +
                (this.getId() === defaultBuildingVariant ? "" : "-" + this.getId()) +
                ".png"
        );
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {MetaBuilding} building
     * @returns {AtlasSprite}
     */
    static getBlueprintSprite(rotationVariant, building) {
        return Loader.getSprite(
            "sprites/blueprints/" +
                building.id +
                (this.getId() === defaultBuildingVariant ? "" : "-" + this.getId()) +
                ".png"
        );
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {MetaBuilding} building
     * @returns {AtlasSprite}
     */
    static getPreviewSprite(rotationVariant, building) {
        return Loader.getSprite(
            "sprites/buildings/" +
                building.id +
                (this.getId() === defaultBuildingVariant ? "" : "-" + this.getId()) +
                ".png"
        );
    }

    /**
     * Whether to rotate automatically in the dragging direction while placing
     */
    static getRotateAutomaticallyWhilePlacing() {
        return false;
    }

    /**
     * Should return the dimensions of the building
     */
    static getDimensions() {
        return new Vector(1, 1);
    }
}
