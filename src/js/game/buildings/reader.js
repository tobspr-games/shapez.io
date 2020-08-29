import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { BeltUnderlaysComponent } from "../components/belt_underlays";
import { BeltReaderComponent } from "../components/belt_reader";

export class MetaReaderBuilding extends MetaBuilding {
    constructor() {
        super("reader");
    }

    getSilhouetteColor() {
        return "#25fff2";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        // @todo
        return true;
    }

    getDimensions() {
        return new Vector(1, 1);
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
                        direction: enumDirection.right,
                        type: enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalEjector,
                    },
                ],
            })
        );

        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                    },
                ],
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                ],
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                processorType: enumItemProcessorTypes.reader,
                inputsPerCharge: 1,
            })
        );

        entity.addComponent(
            new BeltUnderlaysComponent({
                underlays: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                ],
            })
        );

        entity.addComponent(new BeltReaderComponent());
    }
}
