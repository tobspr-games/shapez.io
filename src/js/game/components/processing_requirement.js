import { Component } from "../component";
import { enumItemProcessorTypes } from "./item_processor";
import { Entity } from "../entity";
import { BOOL_TRUE_SINGLETON } from "../items/boolean_item";
import { BaseItem } from "../base_item";
import { ShapeItem } from "../items/shape_item";

export class ProcessingRequirementComponent extends Component {
    static getId() {
        return "ProcessingRequirement";
    }

    duplicateWithoutContents() {
        return new ProcessingRequirementComponent({
            processorType: this.type
        });
    }

    /**
     *
     * @param {object} param0
     * @param {enumItemProcessorTypes=} param0.processorType Which type of processor this is
     *
     */
    constructor({ processorType = enumItemProcessorTypes.painterQuad }) {
        super();

        // Type of the processor
        this.type = processorType;
    }

    /**
     * Checks whether it's possible to process something
     * @param {Entity} entity
     */
    canProcess(entity) {
        switch (this.type) {
            case enumItemProcessorTypes.painterQuad: {
                // For quad-painter, pins match slots
                // boolean true means "disable input"
                // a color means "disable if not matched"

                const processorComp = entity.components.ItemProcessor;
                const pinsComp = entity.components.WiredPins;

                /** @type {Object.<string, { item: BaseItem, sourceSlot: number }>} */
                const itemsBySlot = {};
                for (let i = 0; i < processorComp.inputSlots.length; ++i) {
                    itemsBySlot[processorComp.inputSlots[i].sourceSlot] = processorComp.inputSlots[i];
                }

                // first slot is the shape
                if (!itemsBySlot[0]) return false;
                const shapeItem = /** @type {ShapeItem} */ (itemsBySlot[0].item);

                // Here we check just basic things`
                // Stop processing if anything except TRUE is
                // set and there is no item.
                for (let i = 0; i < 4; ++i) {
                    const netValue = pinsComp.slots[i].linkedNetwork ?
                        pinsComp.slots[i].linkedNetwork.currentValue :
                        null;

                    const currentItem = itemsBySlot[i + 1];

                    if ((netValue == null || !netValue.equals(BOOL_TRUE_SINGLETON)) && currentItem == null) {
                        let quadCount = 0;

                        const quadNumber = (i + 3) % 4
                        for (let j = 0; j < 4; ++j) {
                            const layer = shapeItem.definition.layers[j];
                            if (layer && layer[quadNumber]) {
                                quadCount++;
                            }
                        }

                        if (quadCount > 0) {
                            return false;
                        }
                    }
                }

                return true;
            }
            default:
                assertAlways(false, "Unknown requirement for " + this.type);
        }
    }


}
