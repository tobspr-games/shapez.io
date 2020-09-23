import { MetaBuilding } from "../meta_building";
import {ItemAcceptorComponent} from "../components/item_acceptor";
import {enumDirection, Vector} from "../../core/vector";
import {enumItemProcessorTypes, ItemProcessorComponent} from "../components/item_processor";
import {enumPinSlotType, WiredPinsComponent} from "../components/wired_pins";

export class MetaPortableHubBuilding extends MetaBuilding {
    constructor() {
        super("portable_hub");
    }

    getIsRotateable(variant) {
        return false;
    }

    getSilhouetteColor() {
        return "#eb5555";
    }

    setupEntityComponents(entity, root) {
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [
                            enumDirection.top,
                            enumDirection.right,
                            enumDirection.bottom,
                            enumDirection.left,
                        ],
                    },
                ],
            })
        );

        entity.addComponent(
            new WiredPinsComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        type: enumPinSlotType.logicalEjector,
                        direction: enumDirection.left,
                    },
                ],
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.hub,
            })
        );
    }
}
