import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";
export type PendingFilterItem = {
    item: BaseItem;
    progress: number;
};

export class FilterComponent extends Component {
    static getId() {
        return "Filter";
    }
    duplicateWithoutContents() {
        return new FilterComponent();
    }
    static getSchema() {
        return {
            pendingItemsToLeaveThrough: types.array(types.structured({
                item: typeItemSingleton,
                progress: types.ufloat,
            })),
            pendingItemsToReject: types.array(types.structured({
                item: typeItemSingleton,
                progress: types.ufloat,
            })),
        };
    }

    constructor() {
        super();
        this.clear();
    }
    clear() {
        /**
         * Items in queue to leave through
         */
        this.pendingItemsToLeaveThrough = [];
        /**
         * Items in queue to reject
         */
        this.pendingItemsToReject = [];
    }
}
