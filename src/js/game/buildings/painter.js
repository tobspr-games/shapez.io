import { globalConfig } from "../../core/config";
import { enumDirection, Vector } from "../../core/vector";
import { enumItemAcceptorItemFilter, ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { enumHubGoalRewards } from "../tutorial_goals";
import { GameRoot } from "../root";

export class MetaPainterBuilding extends MetaBuilding {
    constructor() {
        super("painter");
    }

    getDimensions() {
        return new Vector(2, 1);
    }

    getName() {
        return "Dye";
    }

    getDescription() {
        return "Colors the whole shape on the left input with the color from the right input.";
    }

    getSilhouetteColor() {
        return "#cd9b7d";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 2,
                processorType: enumItemProcessorTypes.painter,
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
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                ],
            })
        );
    }
}
