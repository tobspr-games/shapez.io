import { Loader } from "../core/loader";
import { AtlasSprite } from "../core/sprites";
import { Vector } from "../core/vector";
import { SOUNDS } from "../platform/sound";
import { StaticMapEntityComponent } from "./components/static_map_entity";
import { Entity } from "./entity";
import { GameRoot } from "./root";
import { getCodeFromBuildingData } from "./building_codes";
export const defaultBuildingVariant: any = "default";
export class MetaBuilding {
    public id = id;

        constructor(id) {
    }
    /**
     * Should return all possible variants of this building, no matter
     * if they are already available or will be unlocked later on
     *
     * {}
     */
    static getAllVariantCombinations(): Array<{
        variant: string;
        rotationVariant?: number;
        internalId?: number | string;
    }> {
        throw new Error("implement getAllVariantCombinations");
    }
    /**
     * Returns the id of this building
     */
    getId(): any {
        return this.id;
    }
    /**
     * Returns the edit layer of the building
     * {}
     */
    getLayer(): Layer {
        return "regular";
    }
    /**
     * Should return the dimensions of the building
     */
    getDimensions(variant: any = defaultBuildingVariant): any {
        return new Vector(1, 1);
    }
    /**
     * Returns whether the building has the direction lock switch available
     */
    getHasDirectionLockAvailable(variant: string): any {
        return false;
    }
    /**
     * Whether to stay in placement mode after having placed a building
     */
    getStayInPlacementMode(): any {
        return false;
    }
    /**
     * Can return a special interlaved 9 elements overlay matrix for rendering
     * {}
     */
    getSpecialOverlayRenderMatrix(rotation: number, rotationVariant: number, variant: string, entity: Entity): Array<number> | null {
        return null;
    }
    /**
     * Should return additional statistics about this building
     * {}
     */
    getAdditionalStatistics(root: GameRoot, variant: string): Array<[
        string,
        string
    ]> {
        return [];
    }
    /**
     * Returns whether this building can get replaced
     */
    getIsReplaceable(variant: string, rotationVariant: number): any {
        return false;
    }
    /**
     * Whether to flip the orientation after a building has been placed - useful
     * for tunnels.
     */
    getFlipOrientationAfterPlacement(): any {
        return false;
    }
    /**
     * Whether to show a preview of the wires layer when placing the building
     */
    getShowWiresLayerPreview(): any {
        return false;
    }
    /**
     * Whether to rotate automatically in the dragging direction while placing
     */
    getRotateAutomaticallyWhilePlacing(variant: string): any {
        return false;
    }
    /**
     * Returns whether this building is removable
     * {}
     */
    getIsRemovable(root: GameRoot): boolean {
        return true;
    }
    /**
     * Returns the placement sound
     * {}
     */
    getPlacementSound(): string {
        return SOUNDS.placeBuilding;
    }
        getAvailableVariants(root: GameRoot): any {
        return [defaultBuildingVariant];
    }
    /**
     * Returns a preview sprite
     * {}
     */
    getPreviewSprite(rotationVariant: any = 0, variant: any = defaultBuildingVariant): AtlasSprite {
        return Loader.getSprite("sprites/buildings/" +
            this.id +
            (variant === defaultBuildingVariant ? "" : "-" + variant) +
            ".png");
    }
    /**
     * Returns a sprite for blueprints
     * {}
     */
    getBlueprintSprite(rotationVariant: any = 0, variant: any = defaultBuildingVariant): AtlasSprite {
        return Loader.getSprite("sprites/blueprints/" +
            this.id +
            (variant === defaultBuildingVariant ? "" : "-" + variant) +
            ".png");
    }
    /**
     * Returns whether this building is rotateable
     * {}
     */
    getIsRotateable(): boolean {
        return true;
    }
    /**
     * Returns whether this building is unlocked for the given game
     */
    getIsUnlocked(root: GameRoot): any {
        return true;
    }
    /**
     * Should return a silhouette color for the map overview or null if not set
     */
    getSilhouetteColor(variant: string, rotationVariant: number): any {
        return null;
    }
    /**
     * Should return false if the pins are already included in the sprite of the building
     * {}
     */
    getRenderPins(): boolean {
        return true;
    }
    /**
     * Creates the entity without placing it
     */
    createEntity({ root, origin, rotation, originalRotation, rotationVariant, variant }: {
        root: GameRoot;
        origin: Vector;
        rotation: number=;
        originalRotation: number;
        rotationVariant: number;
        variant: string;
    }): any {
        const entity: any = new Entity(root);
        entity.layer = this.getLayer();
        entity.addComponent(new StaticMapEntityComponent({
            origin: new Vector(origin.x, origin.y),
            rotation,
            originalRotation,
            tileSize: this.getDimensions(variant).copy(),
            code: getCodeFromBuildingData(this, variant, rotationVariant),
        }));
        this.setupEntityComponents(entity, root);
        this.updateVariants(entity, rotationVariant, variant);
        return entity;
    }
    /**
     * Returns the sprite for a given variant
     * {}
     */
    getSprite(rotationVariant: number, variant: string): AtlasSprite {
        return Loader.getSprite("sprites/buildings/" +
            this.id +
            (variant === defaultBuildingVariant ? "" : "-" + variant) +
            ".png");
    }
    /**
     * Should compute the optimal rotation variant on the given tile
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }: {
        root: GameRoot;
        tile: Vector;
        rotation: number;
        variant: string;
        layer: Layer;
    }): {
        rotation: number;
        rotationVariant: number;
        connectedEntities?: Array<Entity>;
    } {
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
     */
    updateVariants(entity: Entity, rotationVariant: number, variant: string): any { }
    // PRIVATE INTERFACE
    /**
     * Should setup the entity components
     * @abstract
     */
    setupEntityComponents(entity: Entity, root: GameRoot): any {
        abstract;
    }
}
