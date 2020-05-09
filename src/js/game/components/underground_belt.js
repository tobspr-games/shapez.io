import { BaseItem } from "../base_item";
import { Component } from "../component";
import { globalConfig } from "../../core/config";

/** @enum {string} */
export const enumUndergroundBeltMode = {
    sender: "sender",
    receiver: "receiver",
};

export class UndergroundBeltComponent extends Component {
    static getId() {
        return "UndergroundBelt";
    }

    /**
     *
     * @param {object} param0
     * @param {enumUndergroundBeltMode=} param0.mode As which type of belt the entity acts
     */
    constructor({ mode = enumUndergroundBeltMode.sender }) {
        super();

        this.mode = mode;

        /**
         * Used on both receiver and sender.
         * Reciever: Used to store the next item to transfer, and to block input while doing this
         * Sender: Used to store which items are currently "travelling"
         * @type {Array<[BaseItem, number]>} Format is [Item, remaining seconds until transfer/ejection]
         */
        this.pendingItems = [];
    }

    /**
     * Tries to accept an item from an external source like a regular belt or building
     * @param {BaseItem} item
     * @param {number} beltSpeed How fast this item travels
     */
    tryAcceptExternalItem(item, beltSpeed) {
        if (this.mode !== enumUndergroundBeltMode.sender) {
            // Only senders accept external items
            return false;
        }

        if (this.pendingItems.length > 0) {
            // We currently have a pending item
            return false;
        }

        console.log("Takes", 1 / beltSpeed);
        this.pendingItems.push([item, 1 / beltSpeed]);
        return true;
    }

    /**
     * Tries to accept a tunneled item
     * @param {BaseItem} item
     * @param {number} travelDistance How many tiles this item has to travel
     * @param {number} beltSpeed How fast this item travels
     */
    tryAcceptTunneledItem(item, travelDistance, beltSpeed) {
        if (this.mode !== enumUndergroundBeltMode.receiver) {
            // Only receivers can accept tunneled items
            return false;
        }

        // Notice: We assume that for all items the travel distance is the same
        const maxItemsInTunnel = (1 + travelDistance) / globalConfig.itemSpacingOnBelts;
        if (this.pendingItems.length >= maxItemsInTunnel) {
            // Simulate a real belt which gets full at some point
            return false;
        }

        // NOTICE:
        // This corresponds to the item ejector - it needs 0.5 additional tiles to eject the item.
        // So instead of adding 1 we add 0.5 only.
        const travelDuration = (travelDistance + 0.5) / beltSpeed;
        console.log(travelDistance, "->", travelDuration);

        this.pendingItems.push([item, travelDuration]);

        // Sort so we can only look at the first ones
        this.pendingItems.sort((a, b) => a[1] - b[1]);

        return true;
    }
}
