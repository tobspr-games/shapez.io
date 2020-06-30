import { globalConfig } from "../../core/config";
import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { BaseItem } from "../base_item";
import { gItemRegistry } from "../../core/global_registries";

const receivedSize = 3;

export class ChainableSplitterComponent extends Component {
    static getId() {
        return "ChainableSplitter";
    }

    static getSchema() {
        return {
            chainable: types.bool,
            inputItem: types.nullable(types.obj(gItemRegistry)),
            receivedItems: types.array(
                types.structured({
                    item: types.obj(gItemRegistry),
                    distance: types.float,
                })
            ),
            received: types.bool,
        };
    }

    duplicateWithoutContents() {
        return new ChainableSplitterComponent({
            chainable: this.chainable,
        });
    }

    constructor({ chainable = false }) {
        super();

        /** @type {boolean} */
        this.chainable = chainable;

        /** @type {BaseItem} */
        this.inputItem = null;

        /** @type {Array<{ item: BaseItem, distance: number }>} */
        this.receivedItems = [];

        /** @type {boolean} */
        this.received = false;
    }

    /**
     * Tries to take the item
     * @param {BaseItem} item
     */
    tryTakeItem(item) {
        if (this.inputItem !== null) {
            return false;
        }

        this.inputItem = item;
        return true;
    }

    /**
     *
     * @param {BaseItem} item
     * @param {number} distance
     */
    tryReceiveItem(item, distance) {
        if (this.received || this.receivedItems.length > receivedSize) {
            return false;
        }

        this.received = true;
        this.receivedItems.push({
            item: item,
            distance: distance,
        });
        this.receivedItems.sort((a, b) => a.distance - b.distance);
        return true;
    }

    resetReceived() {
        this.received = false;
    }
}
