import { Vector, enumDirection } from "../../core/vector";
import { LogicGateComponent, enumLogicGateType } from "../components/logic_gate";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { MetaCutterBuilding } from "./cutter";
import { MetaPainterBuilding } from "./painter";
import { MetaRotaterBuilding } from "./rotater";
import { MetaStackerBuilding } from "./stacker";
/** @enum {string} */
export const enumVirtualProcessorVariants: any = {
    rotater: "rotater",
    unstacker: "unstacker",
    stacker: "stacker",
    painter: "painter",
};
/** @enum {string} */
const enumVariantToGate: any = {
    [defaultBuildingVariant]: enumLogicGateType.cutter,
    [enumVirtualProcessorVariants.rotater]: enumLogicGateType.rotater,
    [enumVirtualProcessorVariants.unstacker]: enumLogicGateType.unstacker,
    [enumVirtualProcessorVariants.stacker]: enumLogicGateType.stacker,
    [enumVirtualProcessorVariants.painter]: enumLogicGateType.painter,
};
const colors: any = {
    [defaultBuildingVariant]: new MetaCutterBuilding().getSilhouetteColor(),
    [enumVirtualProcessorVariants.rotater]: new MetaRotaterBuilding().getSilhouetteColor(),
    [enumVirtualProcessorVariants.unstacker]: new MetaStackerBuilding().getSilhouetteColor(),
    [enumVirtualProcessorVariants.stacker]: new MetaStackerBuilding().getSilhouetteColor(),
    [enumVirtualProcessorVariants.painter]: new MetaPainterBuilding().getSilhouetteColor(),
};
export class MetaVirtualProcessorBuilding extends MetaBuilding {

    constructor() {
        super("virtual_processor");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 42,
                variant: defaultBuildingVariant,
            },
            {
                internalId: 44,
                variant: enumVirtualProcessorVariants.rotater,
            },
            {
                internalId: 45,
                variant: enumVirtualProcessorVariants.unstacker,
            },
            {
                internalId: 50,
                variant: enumVirtualProcessorVariants.stacker,
            },
            {
                internalId: 51,
                variant: enumVirtualProcessorVariants.painter,
            },
        ];
    }
    getSilhouetteColor(variant: any): any {
        return colors[variant];
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
    getAvailableVariants(): any {
        return [
            defaultBuildingVariant,
            enumVirtualProcessorVariants.rotater,
            enumVirtualProcessorVariants.stacker,
            enumVirtualProcessorVariants.painter,
            enumVirtualProcessorVariants.unstacker,
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
            case enumLogicGateType.cutter:
            case enumLogicGateType.unstacker: {
                pinComp.setSlots([
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
                ]);
                break;
            }
            case enumLogicGateType.rotater: {
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
            case enumLogicGateType.stacker:
            case enumLogicGateType.painter: {
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
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.right,
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
