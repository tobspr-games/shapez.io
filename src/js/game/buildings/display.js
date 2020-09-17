import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding, MetaBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { DisplayComponent } from "../components/display";

export class MetaDisplayBuilding extends MetaBuilding {
    constructor() {
        super("display");
    }

    getSilhouetteColor() {
        return "#aaaaaa";
    }

    getAvailableVariants() {
        return [DefaultDisplayVariant];
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        // @todo
        return true;
    }

    getShowWiresLayerPreview() {
        return true;
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
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                ],
            })
        );
        entity.addComponent(new DisplayComponent());
    }
}

export class DefaultDisplayVariant extends MetaBuildingVariant {
    static getId() {
        return defaultBuildingVariant;
    }
}
