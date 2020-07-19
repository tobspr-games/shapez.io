import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { enumItemType } from "../base_item";

/** @enum {string} */
export const enumRotaterVariants = { ccw: "ccw", fl: "fl" };

export class MetaRotaterBuilding extends MetaBuilding {
    constructor() {
        super("rotater");
    }

    getSilhouetteColor() {
        return "#7dc6cd";
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        switch (variant) {
            case defaultBuildingVariant: {
                const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotater);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
            case enumRotaterVariants.ccw: {
                const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotaterCCW);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
            case enumRotaterVariants.fl: {
                const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotaterFL);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
        }
    }

    /**
     *
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        let variants = [defaultBuildingVariant];
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_ccw)) {
            variants.push(enumRotaterVariants.ccw);
        }
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_fl)) {
            variants.push(enumRotaterVariants.fl);
        }
        return variants;
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
                        filter: enumItemType.shape,
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
            case enumRotaterVariants.fl: {
                entity.components.ItemProcessor.type = enumItemProcessorTypes.rotaterFL;
                break;
            }
            default:
                assertAlways(false, "Unknown rotater variant: " + variant);
        }
    }
}
