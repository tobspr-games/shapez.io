import { globalConfig } from "../../core/config";
import { enumDirection, Vector } from "../../core/vector";
import { enumItemAcceptorItemFilter, ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { enumHubGoalRewards } from "../tutorial_goals";
import { GameRoot } from "../root";

/** @enum {string} */
export const enumPainterVariants = { double: "double" };

export class MetaPainterBuilding extends MetaBuilding {
    constructor() {
        super("painter");
    }

    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
                return new Vector(2, 1);
            case enumPainterVariants.double:
                return new Vector(2, 2);
            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }

    getName() {
        return "Dye";
    }

    getDescription() {
        return "Colors the whole shape on the left input with the color from the right input.";
    }

    getSilhouetteColor() {
        return "#cd9b7d";
    }

    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumPainterVariants.double];
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
     * @param {string} variant
     */
    updateVariant(entity, variant) {
        switch (variant) {
            case defaultBuildingVariant: {
                entity.components.ItemAcceptor.setSlots([
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
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.painter;
                entity.components.ItemProcessor.inputsPerCharge = 2;
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
                break;
            }
            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }
}
