import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { enumLayer, GameRoot } from "../root";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";

/** @enum {string} */
export const enumLogicGateVariants = {};

/** @enum {string} */
export const enumVariantToGate = {
    [defaultBuildingVariant]: enumLogicGateType.and,
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

    getLayer() {
        return enumLayer.wires;
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    updateVariants(entity, rotationVariant, variant) {
        entity.components.LogicGate.type = enumVariantToGate[variant];
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new WiredPinsComponent({
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
            })
        );

        entity.addComponent(new LogicGateComponent({}));
    }
}
