import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding, MetaBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

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
     *
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        let variants = [DefaultRotaterVariant];
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_ccw)) {
            variants.push(CCWRotaterVariant);
        }
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_fl)) {
            variants.push(FLRotaterVariant);
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
                        filter: "shape",
                    },
                ],
            })
        );
    }
}

export class DefaultRotaterVariant extends MetaBuildingVariant {
    static getId() {
        return defaultBuildingVariant;
    }

    /**
     * @param {GameRoot} root
     * @returns {Array<[string, string]>}
     */
    static getAdditionalStatistics(root) {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotater);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    static updateEntityComponents(entity, rotationVariant) {
        entity.components.ItemProcessor.type = enumItemProcessorTypes.rotater;
    }
}

export class CCWRotaterVariant extends MetaBuildingVariant {
    static getId() {
        return enumRotaterVariants.ccw;
    }

    /**
     * @param {GameRoot} root
     * @returns {Array<[string, string]>}
     */
    static getAdditionalStatistics(root) {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotaterCCW);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    static updateEntityComponents(entity, rotationVariant) {
        entity.components.ItemProcessor.type = enumItemProcessorTypes.rotaterCCW;
    }
}

export class FLRotaterVariant extends MetaBuildingVariant {
    static getId() {
        return enumRotaterVariants.fl;
    }

    /**
     * @param {GameRoot} root
     * @returns {Array<[string, string]>}
     */
    static getAdditionalStatistics(root) {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotaterFL);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    static updateEntityComponents(entity, rotationVariant) {
        entity.components.ItemProcessor.type = enumItemProcessorTypes.rotaterFL;
    }
}
