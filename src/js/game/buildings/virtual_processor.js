import { Vector, enumDirection } from "../../core/vector";
import { LogicGateComponent, enumLogicGateType } from "../components/logic_gate";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding, MetaBuildingVariant } from "../meta_building";
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

    getAvailableVariants() {
        return [
            CutterVirtualProcessorVariant,
            RotaterVirtualProcessorVariant,
            UnstackerVirtualProcessorVariant,
            AnalyzerVirtualProcessorVariant,
            ShapeCompareProcessorVariant,
        ];
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

export class CutterVirtualProcessorVariant extends MetaBuildingVariant {
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
    }
}

export class AnalyzerVirtualProcessorVariant extends CutterVirtualProcessorVariant {
    static getId() {
        return enumVirtualProcessorVariants.analyzer;
    }
}

export class UnstackerVirtualProcessorVariant extends CutterVirtualProcessorVariant {
    static getId() {
        return enumVirtualProcessorVariants.unstacker;
    }
}

export class RotaterVirtualProcessorVariant extends CutterVirtualProcessorVariant {
    static getId() {
        return enumVirtualProcessorVariants.rotater;
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

export class ShapeCompareProcessorVariant extends CutterVirtualProcessorVariant {
    static getId() {
        return enumVirtualProcessorVariants.shapecompare;
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
