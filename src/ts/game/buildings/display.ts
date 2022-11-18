import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { DisplayComponent } from "../components/display";
import { enumHubGoalRewards } from "../tutorial_goals";
export class MetaDisplayBuilding extends MetaBuilding {

    constructor() {
        super("display");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 40,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#aaaaaa";
    }
        getIsUnlocked(root: GameRoot): any {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_display);
    }
    getDimensions(): any {
        return new Vector(1, 1);
    }
    getShowWiresLayerPreview(): any {
        return true;
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new WiredPinsComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.bottom,
                    type: enumPinSlotType.logicalAcceptor,
                },
            ],
        }));
        entity.addComponent(new DisplayComponent());
    }
}
