import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";
import { BeltUnderlaysComponent } from "../components/belt_underlays";

/** @enum {string} */
export const enumBalancerVariants = {
    merger: "merger",
    mergerInverse: "merger-inverse",
    splitter: "splitter",
    splitterInverse: "splitter-inverse",
};

const overlayMatrices = {
    [defaultBuildingVariant]: null,
    [enumBalancerVariants.merger]: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 1, 0]),
    [enumBalancerVariants.mergerInverse]: generateMatrixRotations([0, 1, 0, 1, 1, 0, 0, 1, 0]),
    [enumBalancerVariants.splitter]: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 1, 0]),
    [enumBalancerVariants.splitterInverse]: generateMatrixRotations([0, 1, 0, 1, 1, 0, 0, 1, 0]),
};

export class MetaBalancerBuilding extends MetaBuilding {
    constructor() {
        super("balancer");
    }

    static getAllVariantCombinations() {
        return [
            {
                internalId: 4,
                variant: defaultBuildingVariant,
            },
            {
                internalId: 5,
                variant: enumBalancerVariants.merger,
            },
            {
                internalId: 6,
                variant: enumBalancerVariants.mergerInverse,
            },
            {
                internalId: 47,
                variant: enumBalancerVariants.splitter,
            },
            {
                internalId: 48,
                variant: enumBalancerVariants.splitterInverse,
            },
        ];
    }

    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
                return new Vector(2, 1);
            case enumBalancerVariants.merger:
            case enumBalancerVariants.mergerInverse:
            case enumBalancerVariants.splitter:
            case enumBalancerVariants.splitterInverse:
                return new Vector(1, 1);
            default:
                assertAlways(false, "Unknown balancer variant: " + variant);
        }
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        const matrix = overlayMatrices[variant];
        if (matrix) {
            return matrix[rotation];
        }
        return null;
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        if (root.gameMode.throughputDoesNotMatter()) {
            return [];
        }

        let speedMultiplier = 2;
        switch (variant) {
            case enumBalancerVariants.merger:
            case enumBalancerVariants.mergerInverse:
            case enumBalancerVariants.splitter:
            case enumBalancerVariants.splitterInverse:
                speedMultiplier = 1;
        }

        const speed =
            (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * speedMultiplier;
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    getSilhouetteColor() {
        return "#555759";
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const deterministic = root.gameMode.getIsDeterministic();

        let available = deterministic ? [] : [defaultBuildingVariant];

        if (!deterministic && root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_merger)) {
            available.push(enumBalancerVariants.merger, enumBalancerVariants.mergerInverse);
        }

        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_splitter)) {
            available.push(enumBalancerVariants.splitter, enumBalancerVariants.splitterInverse);
        }

        return available;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_balancer);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [], // set later
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.balancer,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [], // set later
                renderFloatingItems: false,
            })
        );

        entity.addComponent(new BeltUnderlaysComponent({ underlays: [] }));
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case defaultBuildingVariant: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.bottom,
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(1, 0), direction: enumDirection.top },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(1, 0), direction: enumDirection.top },
                ];

                break;
            }
            case enumBalancerVariants.merger:
            case enumBalancerVariants.mergerInverse: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction:
                            variant === enumBalancerVariants.mergerInverse
                                ? enumDirection.left
                                : enumDirection.right,
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ];

                break;
            }
            case enumBalancerVariants.splitter:
            case enumBalancerVariants.splitterInverse: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction:
                            variant === enumBalancerVariants.splitterInverse
                                ? enumDirection.left
                                : enumDirection.right,
                    },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ];

                break;
            }
            default:
                assertAlways(false, "Unknown balancer variant: " + variant);
        }
    }
}
