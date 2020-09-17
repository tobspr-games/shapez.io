import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding, MetaBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { LeverComponent } from "../components/lever";

export class MetaLeverBuilding extends MetaBuilding {
    constructor() {
        super("lever");
    }

    getSilhouetteColor() {
        // @todo: Render differently based on if its activated or not
        return "#1a678b";
    }

    getAvailableVariants() {
        return [DefaultLeverVariant];
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
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                ],
            })
        );

        entity.addComponent(new LeverComponent({}));
    }
}

export class DefaultLeverVariant extends MetaBuildingVariant {
    static getId() {
        return defaultBuildingVariant;
    }

    static getDimensions() {
        return new Vector(1, 1);
    }

    static getSprite() {
        return null;
    }
}
