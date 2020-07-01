import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { gItemRegistry } from "../../core/global_registries";
import { BaseItem, enumItemType } from "../base_item";
import { ColorItem } from "../items/color_item";
import { ShapeItem } from "../items/shape_item";

/** @enum {string} */
export const enumStorageDisplayType = {
    count: "count",
    rate: "rate",
};

export class StorageComponent extends Component {
    static getId() {
        return "Storage";
    }

    static getSchema() {
        return {
            maximumStorage: types.uint,
            storedCount: types.uint,
            storedItem: types.nullable(types.obj(gItemRegistry)),
            overlayOpacity: types.ufloat,
        };
    }

    duplicateWithoutContents() {
        return new StorageComponent({ maximumStorage: this.maximumStorage });
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
         * Item to be analyzed
         */
        this.itemsToAnalyze = 0;

        /**
         * We compute an opacity to make sure it doesn't flicker
         */
        this.overlayOpacity = 0;

        this.displayType = enumStorageDisplayType.count;
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

        if (itemType === enumItemType.color) {
            return /** @type {ColorItem} */ (this.storedItem).color === /** @type {ColorItem} */ (item).color;
        }

        if (itemType === enumItemType.shape) {
            return (
                /** @type {ShapeItem} */ (this.storedItem).definition.getHash() ===
                /** @type {ShapeItem} */ (item).definition.getHash()
            );
        }
        return false;
    }

    /**
     * @param {BaseItem} item
     */
    takeItem(item) {
        this.storedItem = item;
        this.storedCount++;
        this.itemsToAnalyze++;
    }

    cycleDisplayType() {
        if (this.displayType === enumStorageDisplayType.count) {
            this.displayType = enumStorageDisplayType.rate;
        } else {
            this.displayType = enumStorageDisplayType.count;
        }
    }
}
