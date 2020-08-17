import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";

/** @enum {ItemProcessorType[]} */
export const itemProcessorTypes = [
    "splitter",
    "splitterWires",
    "cutter",
    "cutterQuad",
    "rotater",
    "rotaterCCW",
    "rotaterFL",
    "stacker",
    "trash",
    "mixer",
    "painter",
    "painterDouble",
    "painterQuad",
    "hub",
    "filter",
];

export class ItemProcessorComponent extends Component {
    static getId() {
        return "ItemProcessor";
    }

    static getSchema() {
        return {
            nextOutputSlot: types.uint,
            inputSlots: types.array(
                types.structured({
                    item: typeItemSingleton,
                    sourceSlot: types.uint,
                })
            ),
            itemsToEject: types.array(
                types.structured({
                    item: typeItemSingleton,
                    requiredSlot: types.nullable(types.uint),
                    preferredSlot: types.nullable(types.uint),
                })
            ),
            secondsUntilEject: types.float,
        };
    }

    /**
     *
     * @param {object} param0
     * @param {ItemProcessorType} param0.processorType Which type of processor this is
     * @param {number} param0.inputsPerCharge How many items this machine needs until it can start working
     *
     */
    constructor({ processorType, inputsPerCharge }) {
        super();

        // Which slot to emit next, this is only a preference and if it can't emit
        // it will take the other one. Some machines ignore this (e.g. the splitter) to make
        // sure the outputs always match
        this.nextOutputSlot = 0;

        // Type of the processor
        this.type = processorType;

        // How many inputs we need for one charge
        this.inputsPerCharge = inputsPerCharge;

        /**
         * Our current inputs
         * @type {Array<{ item: BaseItem, sourceSlot: number }>}
         */
        this.inputSlots = [];

        /**
         * What we are currently processing, empty if we don't produce anything rn
         * requiredSlot: Item *must* be ejected on this slot
         * preferredSlot: Item *can* be ejected on this slot, but others are fine too if the one is not usable
         * @type {Array<{item: BaseItem, requiredSlot?: number, preferredSlot?: number}>}
         */
        this.itemsToEject = [];

        /**
         * How long it takes until we are done with the current items
         */
        this.secondsUntilEject = 0;
    }

    duplicateWithoutContents() {
        return new ItemProcessorComponent({
            processorType: this.type,
            inputsPerCharge: this.inputsPerCharge,
        });
    }

    /**
     * Tries to take the item
     * @param {BaseItem} item
     * @param {number} sourceSlot
     */
    tryTakeItem(item, sourceSlot) {
        if (["hub", "trash"].includes(this.type)) {
            // Hub has special logic .. not really nice but efficient.
            this.inputSlots.push({ item, sourceSlot });
            return true;
        }

        // Check that we only take one item per slot
        for (let i = 0; i < this.inputSlots.length; ++i) {
            const slot = this.inputSlots[i];
            if (slot.sourceSlot === sourceSlot) {
                return false;
            }
        }

        this.inputSlots.push({ item, sourceSlot });
        return true;
    }
}
