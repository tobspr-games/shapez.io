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

        /**
         * The linked entity, used to speed up performance. This contains either
         * the entrance or exit depending on the tunnel type
         * @type {LinkedUndergroundBelt}
         */
        this.cachedLinkedEntity = null;

        this.clear();
    }

    clear() {
        /** @type {Array<{ item: BaseItem, progress: number }>} */
        this.consumptionAnimations = [];

        /**
         * Used only on reciever to store which items are currently "travelling"
         * @type {Array<[BaseItem, number]>} Format is [Item, Tile progress]
         */
        this.pendingItems = [];
    }

    /**
     * Tries to accept a tunneled item
     * @param {BaseItem} item
     * @param {number} travelDistance
     * @param {number} startProgress The starting tile progress
     */
    tryAcceptTunneledItem(item, travelDistance, startProgress = 0) {
        if (this.mode !== enumUndergroundBeltMode.receiver) {
            // Only receivers can accept tunneled items
            return false;
        }
        // Notice: We assume that for all items the travel distance is the same
        const maxItemsInTunnel = travelDistance / globalConfig.itemSpacingOnBelts;
        if (this.pendingItems.length >= maxItemsInTunnel) {
            // Simulate a real belt which gets full at some point
            return false;
        }

        this.pendingItems.push([item, startProgress]);
        return true;
    }
}
