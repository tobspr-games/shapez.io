import { gItemRegistry } from "../../core/global_registries";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";

/** @enum {string} */
export const enumItemProcessorTypes = {
    splitter: "splitter",
    splitterWires: "splitterWires",
    cutter: "cutter",
    cutterQuad: "cutterQuad",
    rotater: "rotater",
    rotaterCCW: "rotaterCCW",
    rotaterFL: "rotaterFL",
    stacker: "stacker",
    trash: "trash",
    mixer: "mixer",
    painter: "painter",
    painterDouble: "painterDouble",
    painterQuad: "painterQuad",
    advancedProcessor: "advancedProcessor",
    hub: "hub",
};

export class ItemProcessorComponent extends Component {
    static getId() {
        return "ItemProcessor";
    }

    static getSchema() {
        return {
            nextOutputSlot: types.uint,
            type: types.enum(enumItemProcessorTypes),
            inputsPerCharge: types.uint,

            inputSlots: types.array(
                types.structured({
                    item: types.obj(gItemRegistry),
                    sourceSlot: types.uint,
                })
            ),
            itemsToEject: types.array(
                types.structured({
                    item: types.obj(gItemRegistry),
                    requiredSlot: types.nullable(types.uint),
                    preferredSlot: types.nullable(types.uint),
                })
            ),
            secondsUntilEject: types.float,
        };
    }

    duplicateWithoutContents() {
        return new ItemProcessorComponent({
            processorType: this.type,
            inputsPerCharge: this.inputsPerCharge,
        });
    }

    /**
     *
     * @param {object} param0
     * @param {enumItemProcessorTypes=} param0.processorType Which type of processor this is
     * @param {number=} param0.inputsPerCharge How many items this machine needs until it can start working
     *
     */
    constructor({ processorType = enumItemProcessorTypes.splitter, inputsPerCharge = 1 }) {
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

    /**
     * Tries to take the item
     * @param {BaseItem} item
     * @param {number} sourceSlot
     */
    tryTakeItem(item, sourceSlot) {
        if (this.type === enumItemProcessorTypes.hub || this.type === enumItemProcessorTypes.trash) {
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
