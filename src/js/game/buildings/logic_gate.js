import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant, MetaBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";

/** @enum {string} */
export const enumLogicGateVariants = {
    not: "not",
    xor: "xor",
    or: "or",
    transistor: "transistor",
};

/** @enum {string} */
export const enumVariantToGate = {
    [defaultBuildingVariant]: enumLogicGateType.and,
    [enumLogicGateVariants.not]: enumLogicGateType.not,
    [enumLogicGateVariants.xor]: enumLogicGateType.xor,
    [enumLogicGateVariants.or]: enumLogicGateType.or,
    [enumLogicGateVariants.transistor]: enumLogicGateType.transistor,
};

export class MetaLogicGateBuilding extends MetaBuilding {
    constructor() {
        super("logic_gate");
    }

    getSilhouetteColor() {
        return "#89dc60";
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

    getAvailableVariants() {
        return [ANDGateVariant, NOTGateVariant, XORGateVariant, ORGateVariant, TransistorVariant];
    }

    getRenderPins() {
        // We already have it included
        return false;
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

export class ANDGateVariant extends MetaBuildingVariant {
    static getId() {
        return defaultBuildingVariant;
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    static updateEntityComponents(entity, rotationVariant) {
        const gateType = enumVariantToGate[this.getId()];
        entity.components.LogicGate.type = gateType;
        const pinComp = entity.components.WiredPins;

        this.updateWiredPins(pinComp);
    }

    /**
     * @param {WiredPinsComponent} pinComp
     */
    static updateWiredPins(pinComp) {
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
    }
}

export class NOTGateVariant extends ANDGateVariant {
    static getId() {
        return enumLogicGateVariants.not;
    }

    /**
     * @param {WiredPinsComponent} pinComp
     */
    static updateWiredPins(pinComp) {
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
    }
}

export class XORGateVariant extends ANDGateVariant {
    static getId() {
        return enumLogicGateVariants.xor;
    }
}

export class ORGateVariant extends ANDGateVariant {
    static getId() {
        return enumLogicGateVariants.or;
    }
}

export class TransistorVariant extends ANDGateVariant {
    static getId() {
        return enumLogicGateVariants.transistor;
    }

    /**
     * @param {WiredPinsComponent} pinComp
     */
    static updateWiredPins(pinComp) {
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
                direction: enumDirection.bottom,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);
    }
}
