import { Vector, enumDirection, enumAngleToDirection } from "../core/vector";
import { Loader } from "../core/loader";
import { GameRoot } from "./root";
import { AtlasSprite } from "../core/sprites";
import { Entity } from "./entity";
import { StaticMapEntityComponent } from "./components/static_map_entity";

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
     * Should return the dimensions of the building
     */
    getDimensions() {
        return new Vector(1, 1);
    }

    /**
     * Should return the name of this building
     */
    getName() {
        return this.id;
    }

    /**
     * Should return the description of this building
     */
    getDescription() {
        return "No Description";
    }

    /**
     * Whether to stay in placement mode after having placed a building
     */
    getStayInPlacementMode() {
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
     * Returns a preview sprite
     * @returns {AtlasSprite}
     */
    getPreviewSprite(rotationVariant = 0) {
        return Loader.getSprite("sprites/buildings/" + this.id + ".png");
    }

    /**
     * Returns a sprite for blueprints
     * @returns {AtlasSprite}
     */
    getBlueprintSprite(rotationVariant = 0) {
        return Loader.getSprite("sprites/blueprints/" + this.id + ".png");
    }

    /**
     * Returns whether this building is rotateable
     * @returns {boolean}
     */
    isRotateable() {
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
     */
    getSilhouetteColor() {
        return null;
    }

    /**
     * Creates the entity at the given location
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.origin Origin tile
     * @param {number=} param0.rotation Rotation
     * @param {number=} param0.rotationVariant Rotation variant
     */
    createAndPlaceEntity({ root, origin, rotation = 0, rotationVariant = 0 }) {
        const entity = new Entity(root);
        entity.addComponent(
            new StaticMapEntityComponent({
                spriteKey: "sprites/buildings/" + this.id + ".png",
                origin: new Vector(origin.x, origin.y),
                rotation,
                originalRotation: rotation,
                tileSize: this.getDimensions().copy(),
                silhouetteColor: this.getSilhouetteColor(),
            })
        );

        this.setupEntityComponents(entity, root);
        this.updateRotationVariant(entity, rotationVariant);

        root.map.placeStaticEntity(entity);
        root.entityMgr.registerEntity(entity);
        return entity;
    }

    /**
     * Should compute the optimal rotation variant on the given tile
     * @param {GameRoot} root
     * @param {Vector} tile
     * @param {number} rotation
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile(root, tile, rotation) {
        if (!this.isRotateable()) {
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
     * Should update the entity to match the given rotation variant
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    updateRotationVariant(entity, rotationVariant) {}

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
