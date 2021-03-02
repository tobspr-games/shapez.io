import { formatBigNumber, formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaCutterBuilding extends MetaBuilding {
    constructor() {
        super("cutter");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        return MetaCutterBuilding.silhouetteColors[variant]();
    }

    /**
     * Returns the edit layer of the building
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Layer}
     */
    getLayer(root, variant) {
        // @ts-ignore
        return MetaCutterBuilding.layerByVariant[variant](root);
    }

    /**
     * @param {string} variant
     */
    getDimensions(variant) {
        return MetaCutterBuilding.dimensions[variant]();
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        // @ts-ignore
        return MetaCutterBuilding.additionalStatistics[variant](root);
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaCutterBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            if (variants[variant](root)) available.push(variant);
        }

        return available;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        MetaCutterBuilding.setupEntityComponents.forEach(func => func(entity));
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaCutterBuilding.componentVariations[variant](entity, rotationVariant);
    }

    static setupEntityComponents = [
        entity =>
            entity.addComponent(
                new ItemProcessorComponent({
                    inputsPerCharge: 1,
                    processorType: enumItemProcessorTypes.cutter,
                })
            ),
        entity => entity.addComponent(new ItemEjectorComponent({})),
        entity =>
            entity.addComponent(
                new ItemAcceptorComponent({
                    slots: [
                        {
                            pos: new Vector(0, 0),
                            directions: [enumDirection.bottom],
                            filter: "shape",
                        },
                    ],
                })
            ),
    ];

    static variants = {
        quad: "quad",
    };

    static overlayMatrices = {
        [defaultBuildingVariant]: (entity, rotationVariant) => null,
        [MetaCutterBuilding.variants.quad]: (entity, rotationVariant) => null,
    };

    static dimensions = {
        [defaultBuildingVariant]: () => new Vector(2, 1),
        [MetaCutterBuilding.variants.quad]: () => new Vector(4, 1),
    };

    static silhouetteColors = {
        [defaultBuildingVariant]: () => "#7dcda2",
        [MetaCutterBuilding.variants.quad]: () => "#7dcda2",
    };

    static avaibleVariants = {
        [defaultBuildingVariant]: root =>
            root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash),
        [MetaCutterBuilding.variants.quad]: root =>
            root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_quad),
    };

    static layerByVariant = {
        [defaultBuildingVariant]: root => "regular",
        [MetaCutterBuilding.variants.quad]: root => "regular",
    };

    static layerPreview = {
        [defaultBuildingVariant]: () => null,
        [MetaCutterBuilding.variants.quad]: () => null,
    };

    static isRemovable = {
        [defaultBuildingVariant]: () => true,
        [MetaCutterBuilding.variants.quad]: () => true,
    };

    static isRotateable = {
        [defaultBuildingVariant]: () => true,
        [MetaCutterBuilding.variants.quad]: () => true,
    };

    static additionalStatistics = {
        /**
         * @param {*} root
         * @returns {Array<[string, string]>}
         */
        [defaultBuildingVariant]: root => [
            [
                T.ingame.buildingPlacement.infoTexts.speed,
                formatItemsPerSecond(root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.cutter) / 2),
            ],
        ],

        /**
         * @param {*} root
         * @returns {Array<[string, string]>}
         */
        [MetaCutterBuilding.variants.quad]: root => [
            [
                T.ingame.buildingPlacement.infoTexts.speed,
                formatItemsPerSecond(
                    root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.cutterQuad) / 2
                ),
            ],
        ],
    };

    static componentVariations = {
        [defaultBuildingVariant]: (entity, rotationVariant) => {
            entity.components.ItemEjector.setSlots([
                { pos: new Vector(0, 0), direction: enumDirection.top },
                { pos: new Vector(1, 0), direction: enumDirection.top },
            ]);

            entity.components.ItemProcessor.type = enumItemProcessorTypes.cutter;
        },

        [MetaCutterBuilding.variants.quad]: (entity, rotationVariant) => {
            entity.components.ItemEjector.setSlots([
                { pos: new Vector(0, 0), direction: enumDirection.top },
                { pos: new Vector(1, 0), direction: enumDirection.top },
                { pos: new Vector(2, 0), direction: enumDirection.top },
                { pos: new Vector(3, 0), direction: enumDirection.top },
            ]);
            entity.components.ItemProcessor.type = enumItemProcessorTypes.cutterQuad;
        },
    };
}
