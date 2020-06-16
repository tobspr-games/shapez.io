import { globalConfig } from "../../core/config";
import { enumDirection, Vector } from "../../core/vector";
import { enumItemAcceptorItemFilter, ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { enumHubGoalRewards } from "../tutorial_goals";
import { GameRoot } from "../root";
import { T } from "../../translations";
import { formatItemsPerSecond } from "../../core/utils";

/** @enum {string} */
export const enumPainterVariants = { mirrored: "mirrored", double: "double", quad: "quad" };

export class MetaPainterBuilding extends MetaBuilding {
    constructor() {
        super("painter");
    }

    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
            case enumPainterVariants.mirrored:
                return new Vector(2, 1);
            case enumPainterVariants.double:
                return new Vector(2, 2);
            case enumPainterVariants.quad:
                return new Vector(4, 1);
            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }

    getSilhouetteColor() {
        return "#cd9b7d";
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        switch (variant) {
            case defaultBuildingVariant:
            case enumPainterVariants.mirrored: {
                const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.painter);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
            case enumPainterVariants.double: {
                const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.painterDouble);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed, true)]];
            }
            case enumPainterVariants.quad: {
                const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.painterQuad);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
        }
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        let variants = [defaultBuildingVariant, enumPainterVariants.mirrored];
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter_double)) {
            variants.push(enumPainterVariants.double);
        }
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter_quad)) {
            variants.push(enumPainterVariants.quad);
        }
        return variants;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new ItemProcessorComponent({}));

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(1, 0), direction: enumDirection.right }],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.top],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                ],
            })
        );
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case defaultBuildingVariant:
            case enumPainterVariants.mirrored: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [
                            variant === defaultBuildingVariant ? enumDirection.top : enumDirection.bottom,
                        ],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.painter;
                entity.components.ItemProcessor.inputsPerCharge = 2;
                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(1, 0), direction: enumDirection.right },
                ]);
                break;
            }
            case enumPainterVariants.double: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.top],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.painterDouble;
                entity.components.ItemProcessor.inputsPerCharge = 3;

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(1, 0), direction: enumDirection.right },
                ]);
                break;
            }
            case enumPainterVariants.quad: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                    {
                        pos: new Vector(2, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                    {
                        pos: new Vector(3, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.painterQuad;
                entity.components.ItemProcessor.inputsPerCharge = 5;

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);
                break;
            }
            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }
}
