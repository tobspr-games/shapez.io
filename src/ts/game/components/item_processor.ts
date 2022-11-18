import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
/** @enum {string} */
export const enumItemProcessorTypes: any = {
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
export const enumItemProcessorRequirements: any = {
    painterQuad: "painterQuad",
};
export type EjectorItemToEject = {
    item: BaseItem;
    requiredSlot?: number;
    preferredSlot?: number;
};
export type EjectorCharge = {
    remainingTime: number;
    items: Array<EjectorItemToEject>;
};


export class ItemProcessorComponent extends Component {
    static getId(): any {
        return "ItemProcessor";
    }
    static getSchema(): any {
        return {
            nextOutputSlot: types.uint,
        };
    }
    public inputsPerCharge = inputsPerCharge;
    public type = processorType;
    public processingRequirement = processingRequirement;
    public inputSlots: Map<number, BaseItem> = new Map();

        constructor({ processorType = enumItemProcessorTypes.balancer, processingRequirement = null, inputsPerCharge = 1, }) {
        super();
        this.clear();
    }
    clear(): any {
        // Which slot to emit next, this is only a preference and if it can't emit
        // it will take the other one. Some machines ignore this (e.g. the balancer) to make
        // sure the outputs always match
        this.nextOutputSlot = 0;
        this.inputSlots.clear();
        /**
         * Current input count
         */
        this.inputCount = 0;
        /**
         * What we are currently processing, empty if we don't produce anything rn
         * requiredSlot: Item *must* be ejected on this slot
         * preferredSlot: Item *can* be ejected on this slot, but others are fine too if the one is not usable
         */
        this.ongoingCharges = [];
        /**
         * How much processing time we have left from the last tick
         */
        this.bonusTime = 0;
                this.queuedEjects = [];
    }
    /**
     * Tries to take the item
     */
    tryTakeItem(item: BaseItem, sourceSlot: number): any {
        if (this.type === enumItemProcessorTypes.hub ||
            this.type === enumItemProcessorTypes.trash ||
            this.type === enumItemProcessorTypes.goal) {
            // Hub has special logic .. not really nice but efficient.
            this.inputSlots.set(this.inputCount, item);
            this.inputCount++;
            return true;
        }
        // Check that we only take one item per slot
        if (this.inputSlots.has(sourceSlot)) {
            return false;
        }
        this.inputSlots.set(sourceSlot, item);
        this.inputCount++;
        return true;
    }
}
