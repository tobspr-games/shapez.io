import { enumDirection, Vector } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { round1Digit, round2Digits, formatItemsPerSecond } from "../../core/utils";

/** @enum {string} */
export const enumMinerVariants = { chainable: "chainable" };

export class MetaMinerBuilding extends MetaBuilding {
    constructor() {
        super("miner");
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
        const speed = root.hubGoals.getMinerBaseSpeed();
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     *
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable)) {
            return [defaultBuildingVariant, enumMinerVariants.chainable];
        }
        return super.getAvailableVariants(root);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     * @param {GameRoot} root
     */
    setupEntityComponents(entity, root) {
        let itemBelow = null;
        if (root) {
            const staticComp = entity.components.StaticMapEntity;
            itemBelow = root.map.getLowerLayerContentXY(staticComp.origin.x, staticComp.origin.y);
        }
        entity.addComponent(new MinerComponent({ minedItem: itemBelow }));
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
