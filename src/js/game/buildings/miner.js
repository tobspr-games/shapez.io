import { enumDirection, Vector } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant, MetaBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond } from "../../core/utils";

/** @enum {string} */
export const enumMinerVariants = { chainable: "chainable" };

const overlayMatrix = [1, 1, 1, 1, 0, 1, 1, 1, 1];

export class MetaMinerBuilding extends MetaBuilding {
    constructor() {
        super("miner");
    }

    getSilhouetteColor() {
        return "#b37dcd";
    }

    /**
     *
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        /** @type {Array<typeof MetaBuildingVariant>} */
        const variants = [DefaultMinerVariant];
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable)) {
            variants.push(ChainableMinerVariant);
        }
        return variants;
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
}

export class DefaultMinerVariant extends MetaBuildingVariant {
    static getId() {
        return defaultBuildingVariant;
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getMinerBaseSpeed();
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    static getSpecialOverlayRenderMatrix() {
        return overlayMatrix;
    }

    /**
     * @param {Entity} entity
     */
    static updateEntityComponents(entity) {
        entity.components.Miner.chainable = false;
    }
}

export class ChainableMinerVariant extends DefaultMinerVariant {
    static getId() {
        return enumMinerVariants.chainable;
    }

    /**
     * @param {Entity} entity
     */
    static updateEntityComponents(entity) {
        entity.components.Miner.chainable = true;
    }
}
