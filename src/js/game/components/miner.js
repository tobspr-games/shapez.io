import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";
import { typeItemSingleton } from "../item_resolver";

const chainBufferSize = 6;

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

    constructor({ chainable = false }) {
        super();
        this.lastMiningTime = 0;
        this.chainable = chainable;

        /**
         * @type {BaseItem}
         */
        this.cachedMinedItem = null;

        /**
         * Which miner this miner ejects to, in case its a chainable one.
         * If the value is false, it means there is no entity, and we don't have to re-check
         * @type {Entity|null|false}
         */
        this.cachedChainedMiner = null;

        this.clear();
    }

    clear() {
        /**
         * Stores items from other miners which were chained to this
         * miner.
         * @type {Array<BaseItem>}
         */
        this.itemChainBuffer = [];
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
