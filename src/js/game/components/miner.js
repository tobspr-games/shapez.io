import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";

/**
 * @typedef {{
 * item: BaseItem,
 * extraProgress?: number,
 * }} MinerItem
 */

export class MinerComponent extends Component {
    static getId() {
        return "Miner";
    }

    static getSchema() {
        // cachedMinedItem is not serialized.
        return {
            progress: types.ufloat,
        };
    }

    constructor({ chainable = false }) {
        super();
        this.progress = 0;
        this.chainable = chainable;

        /**
         * The item we are mining beneath us
         * @type {BaseItem}
         */
        this.cachedMinedItem = null;

        /**
         * Which miner this miner ejects to, in case its a chainable one.
         * If the value is false, it means there is no entity, and we don't have to re-check
         * @type {Entity|null|false}
         */
        this.cachedChainedMiner = null;
        /**
         * The miner at the end of the chain, which actually ejects the items
         * If the value is false, it means there is no entity, and we don't have to re-check
         * @type {Entity|null|false}
         */
        this.cachedExitMiner = null;
    }
}
