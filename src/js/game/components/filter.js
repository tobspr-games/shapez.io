import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";

/**
 * @typedef {{
 *   item: BaseItem,
 *   extraProgress: number
 * }} PendingFilterItem
 */

export class FilterComponent extends Component {
    static getId() {
        return "Filter";
    }

    duplicateWithoutContents() {
        return new FilterComponent();
    }

    static getSchema() {
        return {
            pendingItemsToLeaveThrough: types.array(
                types.structured({
                    item: typeItemSingleton,
                    extraProgress: types.ufloat,
                })
            ),

            pendingItemsToReject: types.array(
                types.structured({
                    item: typeItemSingleton,
                    extraProgress: types.ufloat, //@SENSETODO will need save migration
                })
            ),
        };
    }

    constructor() {
        super();

        this.clear();
    }

    clear() {
        /**
         * Items in queue to leave through
         * @type {Array<PendingFilterItem>}
         */
        this.pendingItemsToLeaveThrough = [];

        /**
         * Items in queue to reject
         * @type {Array<PendingFilterItem>}
         */
        this.pendingItemsToReject = [];
    }
}
