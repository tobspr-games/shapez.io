import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";
import { ColorItem } from "../items/color_item";
import { ShapeItem } from "../items/shape_item";

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
    canAcceptItem(item) {
        if (this.storedCount >= this.maximumStorage) {
            return false;
        }
        if (!this.storedItem || this.storedCount === 0) {
            return true;
        }

        const itemType = item.getItemType();

        // Check type matches
        if (itemType !== this.storedItem.getItemType()) {
            return false;
        }

        if (itemType === "color") {
            return /** @type {ColorItem} */ (this.storedItem).color === /** @type {ColorItem} */ (item).color;
        }

        if (itemType === "shape") {
            return (
                /** @type {ShapeItem} */ (this.storedItem).definition.getHash() ===
                /** @type {ShapeItem} */ (item).definition.getHash()
            );
        }
        return false;
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
