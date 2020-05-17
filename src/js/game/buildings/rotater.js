import { globalConfig } from "../../core/config";
import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent, enumItemAcceptorItemFilter } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { enumHubGoalRewards } from "../tutorial_goals";
import { GameRoot } from "../root";

/** @enum {string} */
export const enumRotaterVariants = { ccw: "ccw" };

export class MetaRotaterBuilding extends MetaBuilding {
    constructor() {
        super("rotater");
    }

    getSilhouetteColor() {
        return "#7dc6cd";
    }

    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumRotaterVariants.ccw];
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.rotater,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.shape,
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
            case defaultBuildingVariant: {
                entity.components.ItemProcessor.type = enumItemProcessorTypes.rotater;
                break;
            }
            case enumRotaterVariants.ccw: {
                entity.components.ItemProcessor.type = enumItemProcessorTypes.rotaterCCW;
                break;
            }
            default:
                assertAlways(false, "Unknown rotater variant: " + variant);
        }
    }
}
