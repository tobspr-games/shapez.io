import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";

const chainBufferSize = 3;

export class MinerComponent extends Component {
    static getId() {
        return "Miner";
    }

    static getSchema() {
        // cachedMinedItem is not serialized.
        return {
            lastMiningTime: types.ufloat,
            itemChainBuffer: types.array(typeItemSingleton),
        };
    }

    duplicateWithoutContents() {
        return new MinerComponent({
            chainable: this.chainable,
        });
    }

    constructor({ chainable = false }) {
        super();
        this.lastMiningTime = 0;
        this.chainable = chainable;

        /**
         * Stores items from other miners which were chained to this
         * miner.
         * @type {Array<BaseItem>}
         */
        this.itemChainBuffer = [];

        /**
         * @type {BaseItem}
         */
        this.cachedMinedItem = null;
    }

    /**
     *
     * @param {BaseItem} item
     */
    tryAcceptChainedItem(item) {
        if (this.itemChainBuffer.length > chainBufferSize) {
            // Well, this one is full
            return false;
        }

        this.itemChainBuffer.push(item);
        return true;
    }
}
