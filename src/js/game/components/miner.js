import { globalConfig } from "../../core/config";
import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { BaseItem } from "../base_item";
import { gItemRegistry } from "../../core/global_registries";

const chainBufferSize = 3;

export class MinerComponent extends Component {
    static getId() {
        return "Miner";
    }

    static getSchema() {
        // cachedMinedItem is not serialized.
        return {
            lastMiningTime: types.ufloat,
            chainable: types.bool,
            itemChainBuffer: types.array(types.obj(gItemRegistry)),
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
