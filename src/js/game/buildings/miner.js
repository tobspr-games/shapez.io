import { enumDirection, Vector } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";

/** @enum {string} */
export const enumMinerVariants = { chainable: "chainable" };

const overlayMatrix = {
    [defaultBuildingVariant]: generateMatrixRotations([1, 1, 1, 1, 0, 1, 1, 1, 1]),
    [enumMinerVariants.chainable]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 1, 1, 1]),
};

export class MetaMinerBuilding extends MetaBuilding {
    constructor() {
        super("miner");
    }

    static getAllVariantCombinations() {
        return [
            {
                internalId: 7,
                variant: defaultBuildingVariant,
            },
            {
                internalId: 8,
                variant: enumMinerVariants.chainable,
            },
        ];
    }

    getSilhouetteColor() {
        return "#b37dcd";
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
        const speed = root.hubGoals.getMinerBaseSpeed();
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     *
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable)) {
            return [enumMinerVariants.chainable];
        }
        return super.getAvailableVariants(root);
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        return overlayMatrix[variant][rotation];
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new MinerComponent({}));
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
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
        entity.components.Miner.chainable = variant === enumMinerVariants.chainable;
    }
}
