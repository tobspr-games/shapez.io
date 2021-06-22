import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
const { Set } = require("immutable");

/** @enum {string} */
export const enumItemProcessorTypes = {
    balancer: "balancer",
    cutter: "cutter",
    cutterQuad: "cutterQuad",
    rotater: "rotater",
    rotaterCCW: "rotaterCCW",
    rotater180: "rotater180",
    stacker: "stacker",
    trash: "trash",
    mixer: "mixer",
    painter: "painter",
    painterDouble: "painterDouble",
    painterQuad: "painterQuad",
    hub: "hub",
    filter: "filter",
    reader: "reader",
    goal: "goal",
};

/** @enum {string} */
export const enumItemProcessorRequirements = {
    painterQuad: "painterQuad",
};

const specialCaseProcessorTypes = Set.of(
    enumItemProcessorTypes.hub,
    enumItemProcessorTypes.trash,
    enumItemProcessorTypes.goal
);

/** @typedef {{
 *  item: BaseItem,
 *  requiredSlot?: number,
 *  preferredSlot?: number
 * }} EjectorItemToEject */

/** @typedef {{
 *  remainingTime: number,
 *  items: Array<EjectorItemToEject>,
 * }} EjectorCharge */

export class ItemProcessorComponent extends Component {
    static getId() {
        return "ItemProcessor";
    }

    static getSchema() {
        return {
            nextOutputSlot: types.uint,
        };
    }

    /**
     *
     * @param {object} param0
     * @param {enumItemProcessorTypes=} param0.processorType Which type of processor this is
     * @param {enumItemProcessorRequirements=} param0.processingRequirement Applied processing requirement
     * @param {number=} param0.inputsPerCharge How many items this machine needs until it can start working
     *
     */
    constructor({
        processorType = enumItemProcessorTypes.balancer,
        processingRequirement = null,
        inputsPerCharge = 1,
    }) {
        super();

        // How many inputs we need for one charge
        this.inputsPerCharge = inputsPerCharge;

        // Type of the processor
        this.type = processorType;

        // Type of processing requirement
        this.processingRequirement = processingRequirement;

        /**
         * Our current inputs. Mapping of slot number to item.
         * @type {Map<number, BaseItem>}
         */
        this.inputSlotsMap = new Map();

        this.clear();
    }

    clear() {
        // Which slot to emit next, this is only a preference and if it can't emit
        // it will take the other one. Some machines ignore this (e.g. the balancer) to make
        // sure the outputs always match
        this.nextOutputSlot = 0;

        this.inputSlotsMap.clear();

        /**
         * What we are currently processing, empty if we don't produce anything rn
         * requiredSlot: Item *must* be ejected on this slot
         * preferredSlot: Item *can* be ejected on this slot, but others are fine too if the one is not usable
         * @type {Array<EjectorCharge>}
         */
        this.ongoingCharges = [];

        /**
         * How much processing time we have left from the last tick
         * @type {number}
         */
        this.bonusTime = 0;
    }

    /**
     * Tries to take the item
     * @param {BaseItem} item
     * @param {number} sourceSlot
     */
    tryTakeItem(item, sourceSlot) {
        if (specialCaseProcessorTypes.contains(this.type)) {
            // Hub has special logic .. not really nice but efficient.
            this.inputSlotsMap.set(sourceSlot, item);
            return true;
        }

        if (this.inputSlotsMap.has(sourceSlot)) return false;

        this.inputSlotsMap.set(sourceSlot, item);
        return true;
    }
}
