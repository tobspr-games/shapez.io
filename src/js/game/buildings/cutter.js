import { globalConfig } from "../../core/config";
import { enumDirection, Vector } from "../../core/vector";
import { enumItemAcceptorItemFilter, ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaCutterBuilding extends MetaBuilding {
    constructor() {
        super("cutter");
    }

    getSilhouetteColor() {
        return "#7dcda2";
    }

    getDimensions() {
        return new Vector(2, 1);
    }

    getName() {
        return "Cut Half";
    }

    getDescription() {
        return "Cuts shapes from top to bottom and outputs both halfs. <strong>If you use only one part, be sure to destroy the other part or it will stall!</strong>";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.cutter,
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
