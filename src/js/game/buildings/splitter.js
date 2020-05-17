import { globalConfig } from "../../core/config";
import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

/** @enum {string} */
export const enumSplitterVariants = { compact: "compact", compactInverse: "compact-inverse" };

export class MetaSplitterBuilding extends MetaBuilding {
    constructor() {
        super("splitter");
    }

    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
                return new Vector(2, 1);
            case enumSplitterVariants.compact:
            case enumSplitterVariants.compactInverse:
                return new Vector(1, 1);
            default:
                assertAlways(false, "Unknown splitter variant: " + variant);
        }
    }

    getSilhouetteColor() {
        return "#444";
    }

    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumSplitterVariants.compact, enumSplitterVariants.compactInverse];
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_splitter);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.bottom],
                    },
                ],
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.splitter,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(1, 0), direction: enumDirection.top },
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
            case defaultBuildingVariant: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.bottom],
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(1, 0), direction: enumDirection.top },
                ]);

                entity.components.ItemAcceptor.beltUnderlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(1, 0), direction: enumDirection.top },
                ];

                break;
            }
            case enumSplitterVariants.compact:
            case enumSplitterVariants.compactInverse: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                    },
                    {
                        pos: new Vector(0, 0),
                        directions: [
                            variant === enumSplitterVariants.compactInverse
                                ? enumDirection.left
                                : enumDirection.right,
                        ],
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.ItemAcceptor.beltUnderlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ];

                break;
            }
            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }
}
