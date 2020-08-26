import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { ConstantSignalComponent } from "../components/constant_signal";

export class MetaConstantSignalBuilding extends MetaBuilding {
    constructor() {
        super("constant_signal");
    }

    getSilhouetteColor() {
        return "#2bafda";
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
                ],
            })
        );
        entity.addComponent(new ConstantSignalComponent({}));
    }
}
