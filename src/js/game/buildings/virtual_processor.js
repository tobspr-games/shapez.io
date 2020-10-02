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
export const enumVirtualProcessorVariants = {
    rotater: "rotater",
    unstacker: "unstacker",
    stacker: "stacker",
    painter: "painter",
};

/** @enum {string} */
export const enumVariantToGate = {
    [defaultBuildingVariant]: enumLogicGateType.cutter,
    [enumVirtualProcessorVariants.rotater]: enumLogicGateType.rotater,
    [enumVirtualProcessorVariants.unstacker]: enumLogicGateType.unstacker,
    [enumVirtualProcessorVariants.stacker]: enumLogicGateType.stacker,
    [enumVirtualProcessorVariants.painter]: enumLogicGateType.painter,
};

const colors = {
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

    getSilhouetteColor(variant) {
        return colors[variant];
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_virtual_processing);
    }

    /** @returns {"wires"} **/
    getLayer() {
        return "wires";
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    getAvailableVariants() {
        return [
            defaultBuildingVariant,
            enumVirtualProcessorVariants.rotater,
            enumVirtualProcessorVariants.stacker,
            enumVirtualProcessorVariants.painter,
            enumVirtualProcessorVariants.unstacker,
        ];
    }

    getRenderPins() {
        // We already have it included
        return false;
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    updateVariants(entity, rotationVariant, variant) {
        const gateType = enumVariantToGate[variant];
        entity.components.LogicGate.type = gateType;
        const pinComp = entity.components.WiredPins;
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
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new WiredPinsComponent({
                slots: [],
            })
        );

        entity.addComponent(new LogicGateComponent({}));
    }
}
