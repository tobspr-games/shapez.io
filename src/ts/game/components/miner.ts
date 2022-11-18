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
    public lastMiningTime = 0;
    public chainable = chainable;
    public cachedMinedItem: BaseItem = null;
    public cachedChainedMiner: Entity | null | false = null;

    constructor({ chainable = false }) {
        super();
        this.clear();
    }
    clear() {
        /**
         * Stores items from other miners which were chained to this
         * miner.
         */
        this.itemChainBuffer = [];
    }
        tryAcceptChainedItem(item: BaseItem) {
        if (this.itemChainBuffer.length > chainBufferSize) {
            // Well, this one is full
            return false;
        }
        this.itemChainBuffer.push(item);
        return true;
    }
}
