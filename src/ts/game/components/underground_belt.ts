import { globalConfig } from "../../core/config";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";
import { typeItemSingleton } from "../item_resolver";
/** @enum {string} */
export const enumUndergroundBeltMode: any = {
    sender: "sender",
    receiver: "receiver",
};
export type LinkedUndergroundBelt = {
    entity: Entity;
    distance: number;
};

export class UndergroundBeltComponent extends Component {
    static getId(): any {
        return "UndergroundBelt";
    }
    static getSchema(): any {
        return {
            pendingItems: types.array(types.pair(typeItemSingleton, types.float)),
        };
    }
    public mode = mode;
    public tier = tier;
    public cachedLinkedEntity: LinkedUndergroundBelt = null;

        constructor({ mode = enumUndergroundBeltMode.sender, tier = 0 }) {
        super();
        this.clear();
    }
    clear(): any {
                this.consumptionAnimations = [];
        /**
         * Used on both receiver and sender.
         * Reciever: Used to store the next item to transfer, and to block input while doing this
         * Sender: Used to store which items are currently "travelling"
         * {} Format is [Item, ingame time to eject the item]
         */
        this.pendingItems = [];
    }
    /**
     * Tries to accept an item from an external source like a regular belt or building
     */
    tryAcceptExternalItem(item: BaseItem, beltSpeed: number): any {
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
     */
    tryAcceptTunneledItem(item: BaseItem, travelDistance: number, beltSpeed: number, now: number): any {
        if (this.mode !== enumUndergroundBeltMode.receiver) {
            // Only receivers can accept tunneled items
            return false;
        }
        // Notice: We assume that for all items the travel distance is the same
        const maxItemsInTunnel: any = (2 + travelDistance) / globalConfig.itemSpacingOnBelts;
        if (this.pendingItems.length >= maxItemsInTunnel) {
            // Simulate a real belt which gets full at some point
            return false;
        }
        // NOTICE:
        // This corresponds to the item ejector - it needs 0.5 additional tiles to eject the item.
        // So instead of adding 1 we add 0.5 only.
        // Additionally it takes 1 tile for the acceptor which we just add on top.
        const travelDuration: any = (travelDistance + 1.5) / beltSpeed / globalConfig.itemSpacingOnBelts;
        this.pendingItems.push([item, now + travelDuration]);
        return true;
    }
}
