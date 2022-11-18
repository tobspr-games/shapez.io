import { generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
const overlayMatrix: any = generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 0]);
export class MetaAnalyzerBuilding extends MetaBuilding {

    constructor() {
        super("analyzer");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 43,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#3a52bc";
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
    getSpecialOverlayRenderMatrix(rotation: any, rotationVariant: any, variant: any): any {
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
                    direction: enumDirection.left,
                    type: enumPinSlotType.logicalEjector,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.right,
                    type: enumPinSlotType.logicalEjector,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.bottom,
                    type: enumPinSlotType.logicalAcceptor,
                },
            ],
        }));
        entity.addComponent(new LogicGateComponent({
            type: enumLogicGateType.analyzer,
        }));
    }
}
