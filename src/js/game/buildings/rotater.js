import { globalConfig } from "../../core/config";
import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent, enumItemAcceptorItemFilter } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { enumHubGoalRewards } from "../tutorial_goals";
import { GameRoot } from "../root";

export class MetaRotaterBuilding extends MetaBuilding {
    constructor() {
        super("rotater");
    }

    getName() {
        return "Rotate";
    }

    getDescription() {
        return "Rotates shapes clockwise by 90 degrees.";
    }

    getSilhouetteColor() {
        return "#7dc6cd";
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
}
