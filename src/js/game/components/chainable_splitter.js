import { globalConfig } from "../../core/config";
import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { BaseItem } from "../base_item";
import { gItemRegistry } from "../../core/global_registries";

export class ChainableSplitterComponent extends Component {
    static getId() {
        return "ChainableSplitter";
    }

    static getSchema() {
        return {
            chainable: types.bool,
            inputItem: types.nullable(types.obj(gItemRegistry)),
            ejected: types.bool,
        };
    }

    duplicateWithoutContents() {
        return new ChainableSplitterComponent({
            chainable: this.chainable,
        });
    }

    constructor({ chainable = false }) {
        super();

        this.chainable = chainable;
        this.inputItem = null;
        this.ejected = false;
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
}
