import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { DisplayComponent } from "../components/display";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaDisplayBuilding extends MetaBuilding {
    constructor() {
        super("display");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        return MetaDisplayBuilding.silhouetteColors[variant]();
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaDisplayBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            if (variants[variant](root)) available.push(variant);
        }

        return available;
    }

    /**
     * @param {string} variant
     */
    getIsRemovable(variant) {
        return MetaDisplayBuilding.isRemovable[variant]();
    }

    /**
     * @param {string} variant
     */
    getIsRotateable(variant) {
        return MetaDisplayBuilding.isRotateable[variant]();
    }

    /**
     * @param {string} variant
     */
    getDimensions(variant) {
        return MetaDisplayBuilding.dimensions[variant]();
    }

    /**
     * @param {string} variant
     */
    getShowLayerPreview(variant) {
        return MetaDisplayBuilding.layerPreview[variant]();
    }

    /**
     * Returns the edit layer of the building
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Layer}
     */
    getLayer(root, variant) {
        // @ts-ignore
        return MetaDisplayBuilding.layerByVariant[variant](root);
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        return MetaDisplayBuilding.renderPins[variant]();
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        MetaDisplayBuilding.setupEntityComponents.forEach(func => func(entity));
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaDisplayBuilding.componentVariations[variant](entity, rotationVariant);
    }

    static setupEntityComponents = [
        entity =>
            entity.addComponent(
                new WiredPinsComponent({
                    slots: [
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.bottom,
                            type: enumPinSlotType.logicalAcceptor,
                        },
                    ],
                })
            ),
        entity => entity.addComponent(new DisplayComponent()),
    ];

    static overlayMatrices = {
        [defaultBuildingVariant]: (entity, rotationVariant) => null,
    };

    static dimensions = {
        [defaultBuildingVariant]: () => new Vector(1, 1),
    };

    static silhouetteColors = {
        [defaultBuildingVariant]: () => "#aaaaaa",
    };

    static isRemovable = {
        [defaultBuildingVariant]: () => true,
    };

    static isRotateable = {
        [defaultBuildingVariant]: () => true,
    };

    static avaibleVariants = {
        [defaultBuildingVariant]: root => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_display),
    };

    static layerByVariant = {
        [defaultBuildingVariant]: root => "regular",
    };

    static layerPreview = {
        [defaultBuildingVariant]: () => "wires",
    };

    static renderPins = {
        [defaultBuildingVariant]: () => true,
    };

    static componentVariations = {
        [defaultBuildingVariant]: (entity, rotationVariant) => {
            entity.components.WiredPins.setSlots([
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.bottom,
                    type: enumPinSlotType.logicalAcceptor,
                },
            ]);
        },
    };
}
