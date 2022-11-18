import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { ConstantSignalComponent } from "../components/constant_signal";
import { generateMatrixRotations } from "../../core/utils";
import { enumHubGoalRewards } from "../tutorial_goals";
const overlayMatrix: any = generateMatrixRotations([0, 1, 0, 1, 1, 1, 1, 1, 1]);
export class MetaConstantSignalBuilding extends MetaBuilding {

    constructor() {
        super("constant_signal");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 31,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#2b84fd";
    }
        getIsUnlocked(root: GameRoot): any {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_constant_signal);
    }
    /** {} **/
    getLayer(): "wires" {
        return "wires";
    }
    getDimensions(): any {
        return new Vector(1, 1);
    }
    getRenderPins(): any {
        return false;
    }
    getSpecialOverlayRenderMatrix(rotation: any): any {
        return overlayMatrix[rotation];
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
            ],
        }));
        entity.addComponent(new ConstantSignalComponent({}));
    }
}
