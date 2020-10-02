import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import {
    enumItemProcessorTypes,
    ItemProcessorComponent,
    enumItemProcessorRequirements,
} from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";

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
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers)) {
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
                        filter: "shape",
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.top],
                        filter: "color",
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
                // REGULAR PAINTER

                if (entity.components.WiredPins) {
                    entity.removeComponent(WiredPinsComponent);
                }

                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.left],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [
                            variant === defaultBuildingVariant ? enumDirection.top : enumDirection.bottom,
                        ],
                        filter: "color",
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(1, 0), direction: enumDirection.right },
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.painter;
                entity.components.ItemProcessor.processingRequirement = null;
                entity.components.ItemProcessor.inputsPerCharge = 2;

                break;
            }

            case enumPainterVariants.double: {
                // DOUBLE PAINTER

                if (entity.components.WiredPins) {
                    entity.removeComponent(WiredPinsComponent);
                }

                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.left],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.left],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.top],
                        filter: "color",
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(1, 0), direction: enumDirection.right },
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.painterDouble;
                entity.components.ItemProcessor.processingRequirement = null;
                entity.components.ItemProcessor.inputsPerCharge = 3;
                break;
            }

            case enumPainterVariants.quad: {
                // QUAD PAINTER

                if (!entity.components.WiredPins) {
                    entity.addComponent(new WiredPinsComponent({ slots: [] }));
                }

                entity.components.WiredPins.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(2, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(3, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                ]);

                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.left],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        filter: "color",
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.bottom],
                        filter: "color",
                    },
                    {
                        pos: new Vector(2, 0),
                        directions: [enumDirection.bottom],
                        filter: "color",
                    },
                    {
                        pos: new Vector(3, 0),
                        directions: [enumDirection.bottom],
                        filter: "color",
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.painterQuad;
                entity.components.ItemProcessor.processingRequirement =
                    enumItemProcessorRequirements.painterQuad;
                entity.components.ItemProcessor.inputsPerCharge = 5;

                break;
            }

            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }
}
