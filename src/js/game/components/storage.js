import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";

export class StorageComponent extends Component {
    static getId() {
        return "Storage";
    }

    static getSchema() {
        return {
            storedCount: types.uint,
            storedItem: types.nullable(typeItemSingleton),
        };
    }

    /**
     * @param {object} param0
     * @param {number=} param0.maximumStorage How much this storage can hold
     */
    constructor({ maximumStorage = 1e20 }) {
        super();
        this.maximumStorage = maximumStorage;

        /**
         * Currently stored item
         * @type {BaseItem}
         */
        this.storedItem = null;

        /**
         * How many of this item we have stored
         */
        this.storedCount = 0;

        /**
         * We compute an opacity to make sure it doesn't flicker
         */
        this.overlayOpacity = 0;
    }

    /**
     * Returns whether this storage can accept the item
     * @param {BaseItem} item
     */
    tryAcceptItem(item) {
        if (this.storedCount >= this.maximumStorage) {
            return false;
        }
        const itemType = item.getItemType();
        if (this.storedCount > 0 && this.storedItem && itemType !== this.storedItem.getItemType()) {
            return false;
        }

        this.storedItem = item;
        this.storedCount++;

        return true;
    }

    /**
     * Returns whether the storage is full
     * @returns {boolean}
     */
    getIsFull() {
        return this.storedCount >= this.maximumStorage;
    }

    /**
     * @param {BaseItem} item
     */
    takeItem(item) {
        this.storedItem = item;
        this.storedCount++;
    }
}
