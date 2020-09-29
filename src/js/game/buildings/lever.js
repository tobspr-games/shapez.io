import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { LeverComponent } from "../components/lever";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaLeverBuilding extends MetaBuilding {
    constructor() {
        super("lever");
    }

    getSilhouetteColor() {
        // @todo: Render differently based on if its activated or not
        return "#1a678b";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers);
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    getSprite() {
        return null;
    }

    getShowWiresLayerPreview() {
        return true;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new WiredPinsComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                ],
            })
        );

        entity.addComponent(new LeverComponent({}));
    }
}
