import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding, MetaBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { ConstantSignalComponent } from "../components/constant_signal";

export class MetaConstantSignalBuilding extends MetaBuilding {
    constructor() {
        super("constant_signal");
    }

    getSilhouetteColor() {
        return "#2bafda";
    }

    getAvailableVariants() {
        return [DefaultConstantSignalVariant];
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

    getRenderPins() {
        return false;
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

export class DefaultConstantSignalVariant extends MetaBuildingVariant {
    static getId() {
        return defaultBuildingVariant;
    }
}
