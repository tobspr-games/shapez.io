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
     * Should return all possible variants of this building, no matter
     * if they are already available or will be unlocked later on
     *
     * @returns {Array<{ variant: string, rotationVariant?: number, internalId?: number|string }>}
     */
    static getAllVariantCombinations() {
        throw new Error("implement getAllVariantCombinations");
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
     * Should return the dimensions of the building
     */
    getDimensions(variant = defaultBuildingVariant) {
        return new Vector(1, 1);
    }

    /**
     * Returns whether the building has the direction lock switch available
     * @param {string} variant
     */
    getHasDirectionLockAvailable(variant) {
        return false;
    }

    /**
     * Whether to stay in placement mode after having placed a building
     */
    getStayInPlacementMode() {
        return false;
    }

    /**
     * Can return a special interlaved 9 elements overlay matrix for rendering
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        return null;
    }

    /**
     * Should return additional statistics about this building
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        return [];
    }

    /**
     * Returns whether this building can get replaced
     * @param {string} variant
     * @param {number} rotationVariant
     */
    getIsReplaceable(variant, rotationVariant) {
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
     * Whether to rotate automatically in the dragging direction while placing
     * @param {string} variant
     */
    getRotateAutomaticallyWhilePlacing(variant) {
        return false;
    }

    /**
     * Returns whether this building is removable
     * @param {GameRoot} root
     * @returns {boolean}
     */
    getIsRemovable(root) {
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
     */
    getAvailableVariants(root) {
        return [defaultBuildingVariant];
    }

    /**
     * Returns a preview sprite
     * @returns {AtlasSprite}
     */
    getPreviewSprite(rotationVariant = 0, variant = defaultBuildingVariant) {
        return Loader.getSprite(
            "sprites/buildings/" +
                this.id +
                (variant === defaultBuildingVariant ? "" : "-" + variant) +
                ".png"
        );
    }

    /**
     * Returns a sprite for blueprints
     * @returns {AtlasSprite}
     */
    getBlueprintSprite(rotationVariant = 0, variant = defaultBuildingVariant) {
        return Loader.getSprite(
            "sprites/blueprints/" +
                this.id +
                (variant === defaultBuildingVariant ? "" : "-" + variant) +
                ".png"
        );
    }

    /**
     * Returns whether this building is rotateable
     * @returns {boolean}
     */
    getIsRotateable() {
        return true;
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
     * @param {string} variant
     * @param {number} rotationVariant
     */
    getSilhouetteColor(variant, rotationVariant) {
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
     * @param {string} param0.variant
     */
    createEntity({ root, origin, rotation, originalRotation, rotationVariant, variant }) {
        const entity = new Entity(root);
        entity.layer = this.getLayer();
        entity.addComponent(
            new StaticMapEntityComponent({
                origin: new Vector(origin.x, origin.y),
                rotation,
                originalRotation,
                tileSize: this.getDimensions(variant).copy(),
                code: getCodeFromBuildingData(this, variant, rotationVariant),
            })
        );
        this.setupEntityComponents(entity, root);
        this.updateVariants(entity, rotationVariant, variant);
        return entity;
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {string} variant
     * @returns {AtlasSprite}
     */
    getSprite(rotationVariant, variant) {
        return Loader.getSprite(
            "sprites/buildings/" +
                this.id +
                (variant === defaultBuildingVariant ? "" : "-" + variant) +
                ".png"
        );
    }

    /**
     * Should compute the optimal rotation variant on the given tile
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.tile
     * @param {number} param0.rotation
     * @param {string} param0.variant
     * @param {Layer} param0.layer
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }) {
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
     * Should update the entity to match the given variants
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {}

    // PRIVATE INTERFACE

    /**
     * Should setup the entity components
     * @param {Entity} entity
     * @param {GameRoot} root
     * @abstract
     */
    setupEntityComponents(entity, root) {
        abstract;
    }
}
