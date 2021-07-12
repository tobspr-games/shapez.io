import { enumDirection, Vector } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { ItemProducerComponent } from "../components/item_producer";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";

export class MetaItemProducerBuilding extends MetaBuilding {
    constructor() {
        super("item_producer");
    }

    getSilhouetteColor() {
        return "#b37dcd";
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
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
            })
        );
        entity.addComponent(
            new WiredPinsComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        type: enumPinSlotType.logicalAcceptor,
                        direction: enumDirection.bottom,
                    },
                ],
            })
        );
        entity.addComponent(new ItemProducerComponent());
    }
}
