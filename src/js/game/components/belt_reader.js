import { Component } from "../component";
import { BaseItem } from "../base_item";
import { typeItemSingleton } from "../item_resolver";
import { types } from "../../savegame/serialization";

/** @enum {string} */
export const enumBeltReaderType = {
    wired: "wired",
    wireless: "wireless",
};

export class BeltReaderComponent extends Component {
    static getId() {
        return "BeltReader";
    }

    static getSchema() {
        return {
            type: types.string,
            lastItem: types.nullable(typeItemSingleton),
        };
    }

    /**
     * @param {object} param0
     * @param {string=} param0.type
     */
    constructor({ type = enumBeltReaderType.wired }) {
        super();

        this.type = type;

        this.clear();
    }

    clear() {
        /**
         * Which items went through the reader, we only store the time
         * @type {Array<number>}
         */
        this.lastItemTimes = [];

        /**
         * Which item passed the reader last
         * @type {BaseItem}
         */
        this.lastItem = null;

        /**
         * Stores the last throughput we computed
         * @type {number}
         */
        this.lastThroughput = 0;

        /**
         * Stores when we last computed the throughput
         * @type {number}
         */
        this.lastThroughputComputation = 0;
    }

    isWireless() {
        return this.type === enumBeltReaderType.wireless;
    }
}
