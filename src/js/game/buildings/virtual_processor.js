import { Vector, enumDirection } from "../../core/vector";
import { LogicGateComponent, enumLogicGateType } from "../components/logic_gate";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";

/** @enum {string} */
export const enumVirtualProcessorVariants = {
    analyzer: "analyzer",
    rotater: "rotater",
    unstacker: "unstacker",
    shapecompare: "shapecompare",
};

/** @enum {string} */
export const enumVariantToGate = {
    [defaultBuildingVariant]: enumLogicGateType.cutter,
    [enumVirtualProcessorVariants.analyzer]: enumLogicGateType.analyzer,
    [enumVirtualProcessorVariants.rotater]: enumLogicGateType.rotater,
    [enumVirtualProcessorVariants.unstacker]: enumLogicGateType.unstacker,
    [enumVirtualProcessorVariants.shapecompare]: enumLogicGateType.shapecompare,
};

export class MetaVirtualProcessorBuilding extends MetaBuilding {
    constructor() {
        super("virtual_processor");
    }

    getSilhouetteColor() {
        return "#823cab";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        // @todo
        return true;
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
            enumVirtualProcessorVariants.unstacker,
            enumVirtualProcessorVariants.analyzer,
            enumVirtualProcessorVariants.shapecompare,
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
            case enumLogicGateType.analyzer:
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
            case enumLogicGateType.shapecompare: {
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
