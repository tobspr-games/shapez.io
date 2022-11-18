import { enumDirection, Vector } from "../../core/vector";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
export class MetaComparatorBuilding extends MetaBuilding {

    constructor() {
        super("comparator");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 46,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#823cab";
    }
        getIsUnlocked(root: GameRoot): any {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_virtual_processing);
    }
    /** {} **/
    getLayer(): "wires" {
        return "wires";
    }
    getDimensions(): any {
        return new Vector(1, 1);
    }
    getRenderPins(): any {
        // We already have it included
        return false;
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new WiredPinsComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.top,
                    type: enumPinSlotType.logicalEjector,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.left,
                    type: enumPinSlotType.logicalAcceptor,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.right,
                    type: enumPinSlotType.logicalAcceptor,
                },
            ],
        }));
        entity.addComponent(new LogicGateComponent({
            type: enumLogicGateType.compare,
        }));
    }
}
