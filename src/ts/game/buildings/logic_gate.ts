import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
import { generateMatrixRotations } from "../../core/utils";
import { enumHubGoalRewards } from "../tutorial_goals";
/** @enum {string} */
export const enumLogicGateVariants: any = {
    not: "not",
    xor: "xor",
    or: "or",
};
/** @enum {string} */
const enumVariantToGate: any = {
    [defaultBuildingVariant]: enumLogicGateType.and,
    [enumLogicGateVariants.not]: enumLogicGateType.not,
    [enumLogicGateVariants.xor]: enumLogicGateType.xor,
    [enumLogicGateVariants.or]: enumLogicGateType.or,
};
const overlayMatrices: any = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 1]),
    [enumLogicGateVariants.xor]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 1]),
    [enumLogicGateVariants.or]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 1]),
    [enumLogicGateVariants.not]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
};
const colors: any = {
    [defaultBuildingVariant]: "#f48d41",
    [enumLogicGateVariants.xor]: "#f4a241",
    [enumLogicGateVariants.or]: "#f4d041",
    [enumLogicGateVariants.not]: "#f44184",
};
export class MetaLogicGateBuilding extends MetaBuilding {

    constructor() {
        super("logic_gate");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 32,
                variant: defaultBuildingVariant,
            },
            {
                internalId: 34,
                variant: enumLogicGateVariants.not,
            },
            {
                internalId: 35,
                variant: enumLogicGateVariants.xor,
            },
            {
                internalId: 36,
                variant: enumLogicGateVariants.or,
            },
        ];
    }
    getSilhouetteColor(variant: any): any {
        return colors[variant];
    }
        getIsUnlocked(root: GameRoot): any {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_logic_gates);
    }
    /** {} **/
    getLayer(): "wires" {
        return "wires";
    }
    getDimensions(): any {
        return new Vector(1, 1);
    }
    getSpecialOverlayRenderMatrix(rotation: any, rotationVariant: any, variant: any): any {
        return overlayMatrices[variant][rotation];
    }
    getAvailableVariants(): any {
        return [
            defaultBuildingVariant,
            enumLogicGateVariants.or,
            enumLogicGateVariants.not,
            enumLogicGateVariants.xor,
        ];
    }
    getRenderPins(): any {
        // We already have it included
        return false;
    }
        updateVariants(entity: Entity, rotationVariant: number, variant: any): any {
        const gateType: any = enumVariantToGate[variant];
        entity.components.LogicGate.type = gateType;
        const pinComp: any = entity.components.WiredPins;
        switch (gateType) {
            case enumLogicGateType.and:
            case enumLogicGateType.xor:
            case enumLogicGateType.or: {
                pinComp.setSlots([
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
                ]);
                break;
            }
            case enumLogicGateType.not: {
                pinComp.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                ]);
                break;
            }
            default:
                assertAlways("unknown logic gate type: " + gateType);
        }
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new WiredPinsComponent({
            slots: [],
        }));
        entity.addComponent(new LogicGateComponent({}));
    }
}
