import { enumDirection, Vector } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

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
     * @param {GameRoot} root
     * @param {object} param0
     * @param {Vector} param0.origin
     * @param {number} param0.rotation
     * @param {number} param0.rotationVariant
     * @param {string} param0.variant
     */
    performAdditionalPlacementChecks(root, { origin, rotation, rotationVariant, variant }) {
        // Make sure its placed above a resource
        const lowerLayer = root.map.getLowerLayerContentXY(origin.x, origin.y);
        if (!lowerLayer) {
            return false;
        }
        return true;
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
