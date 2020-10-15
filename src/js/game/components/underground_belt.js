import { globalConfig } from "../../core/config";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";
import { typeItemSingleton } from "../item_resolver";

/** @enum {string} */
export const enumUndergroundBeltMode = {
    sender: "sender",
    receiver: "receiver",
};

/**
 * @typedef {{
 *   entity: Entity,
 *   distance: number
 * }} LinkedUndergroundBelt
 */

export class UndergroundBeltComponent extends Component {
    static getId() {
        return "UndergroundBelt";
    }

    static getSchema() {
        return {
            pendingItems: types.array(types.pair(typeItemSingleton, types.float)),
        };
    }

    /**
     *
     * @param {object} param0
     * @param {enumUndergroundBeltMode=} param0.mode As which type of belt the entity acts
     * @param {number=} param0.tier
     */
    constructor({ mode = enumUndergroundBeltMode.sender, tier = 0 }) {
        super();

        this.mode = mode;
        this.tier = tier;

        /** @type {Array<{ item: BaseItem, progress: number }>} */
        this.consumptionAnimations = [];

        /**
         * Used on both receiver and sender.
         * Reciever: Used to store the next item to transfer, and to block input while doing this
         * Sender: Used to store which items are currently "travelling"
         * @type {Array<[BaseItem, number]>} Format is [Item, ingame time to eject the item]
         */
        this.pendingItems = [];

        /**
         * The linked entity, used to speed up performance. This contains either
         * the entrance or exit depending on the tunnel type
         * @type {LinkedUndergroundBelt}
         */
        this.cachedLinkedEntity = null;
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

        this.pendingItems.push([item, 0]);
        return true;
    }

    /**
     * Tries to accept a tunneled item
     * @param {BaseItem} item
     * @param {number} travelDistance How many tiles this item has to travel
     * @param {number} beltSpeed How fast this item travels
     * @param {number} now Current ingame time
     */
    tryAcceptTunneledItem(item, travelDistance, beltSpeed, now) {
        if (this.mode !== enumUndergroundBeltMode.receiver) {
            // Only receivers can accept tunneled items
            return false;
        }

        // Notice: We assume that for all items the travel distance is the same
        const maxItemsInTunnel = (2 + travelDistance) / globalConfig.itemSpacingOnBelts;
        if (this.pendingItems.length >= maxItemsInTunnel) {
            // Simulate a real belt which gets full at some point
            return false;
        }

        // NOTICE:
        // This corresponds to the item ejector - it needs 0.5 additional tiles to eject the item.
        // So instead of adding 1 we add 0.5 only.
        // Additionally it takes 1 tile for the acceptor which we just add on top.
        const travelDuration = (travelDistance + 1.5) / beltSpeed / globalConfig.itemSpacingOnBelts;

        this.pendingItems.push([item, now + travelDuration]);
        return true;
    }
}
