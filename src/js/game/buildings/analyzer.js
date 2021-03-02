import { generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaAnalyzerBuilding extends MetaBuilding {
    constructor() {
        super("analyzer");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        return MetaAnalyzerBuilding.silhouetteColors[variant]();
    }

    /**
     * @param {string} variant
     */
    getIsRemovable(variant) {
        return MetaAnalyzerBuilding.isRemovable[variant]();
    }

    /**
     * @param {string} variant
     */
    getIsRotateable(variant) {
        return MetaAnalyzerBuilding.isRotateable[variant]();
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaAnalyzerBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            if (variants[variant](root)) available.push(variant);
        }

        return available;
    }

    /**
     * Returns the edit layer of the building
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Layer}
     */
    getLayer(root, variant) {
        return MetaAnalyzerBuilding.layerByVariant[variant](root);
    }

    /**
     * @param {string} variant
     */
    getDimensions(variant) {
        return MetaAnalyzerBuilding.dimensions[variant]();
    }

    /**
     * @param {string} variant
     */
    getShowLayerPreview(variant) {
        return MetaAnalyzerBuilding.layerPreview[variant]();
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        let matrices = MetaAnalyzerBuilding.overlayMatrices[variant](entity, rotationVariant);
        return matrices ? matrices[rotation] : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        return MetaAnalyzerBuilding.renderPins[variant]();
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        MetaAnalyzerBuilding.setupEntityComponents.forEach(func => func(entity));
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaAnalyzerBuilding.componentVariations[variant](entity, rotationVariant);
    }

    static setupEntityComponents = [
        entity =>
            entity.addComponent(
                new WiredPinsComponent({
                    slots: [
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.left,
                            type: enumPinSlotType.logicalEjector,
                        },
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.right,
                            type: enumPinSlotType.logicalEjector,
                        },
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.bottom,
                            type: enumPinSlotType.logicalAcceptor,
                        },
                    ],
                })
            ),

        entity =>
            entity.addComponent(
                new LogicGateComponent({
                    type: enumLogicGateType.analyzer,
                })
            ),
    ];

    static silhouetteColors = {
        [defaultBuildingVariant]: () => "#555759",
    };

    static avaibleVariants = {
        [defaultBuildingVariant]: root =>
            root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_virtual_processing),
    };

    static overlayMatrices = {
        [defaultBuildingVariant]: (entity, rotationVariant) =>
            generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 0]),
    };

    static dimensions = {
        [defaultBuildingVariant]: () => new Vector(1, 1),
    };

    static renderPins = {
        [defaultBuildingVariant]: () => false,
    };

    static layerByVariant = {
        [defaultBuildingVariant]: root => "wires",
    };

    static isRemovable = {
        [defaultBuildingVariant]: () => true,
    };

    static isRotateable = {
        [defaultBuildingVariant]: () => true,
    };

    static layerPreview = {
        [defaultBuildingVariant]: () => "wires",
    };

    static componentVariations = {
        [defaultBuildingVariant]: (entity, rotationVariant) => {
            entity.components.WiredPins.setSlots([
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.left,
                    type: enumPinSlotType.logicalEjector,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.right,
                    type: enumPinSlotType.logicalEjector,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.bottom,
                    type: enumPinSlotType.logicalAcceptor,
                },
            ]);

            entity.components.LogicGate.type = enumLogicGateType.analyzer;
        },
    };
}
