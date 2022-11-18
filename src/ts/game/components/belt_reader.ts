import { Component } from "../component";
import { BaseItem } from "../base_item";
import { typeItemSingleton } from "../item_resolver";
import { types } from "../../savegame/serialization";
/** @enum {string} */
export const enumBeltReaderType: any = {
    wired: "wired",
    wireless: "wireless",
};
export class BeltReaderComponent extends Component {
    static getId(): any {
        return "BeltReader";
    }
    static getSchema(): any {
        return {
            lastItem: types.nullable(typeItemSingleton),
        };
    }

    constructor() {
        super();
        this.clear();
    }
    clear(): any {
        /**
         * Which items went through the reader, we only store the time
         */
        this.lastItemTimes = [];
        /**
         * Which item passed the reader last
         */
        this.lastItem = null;
        /**
         * Stores the last throughput we computed
         */
        this.lastThroughput = 0;
        /**
         * Stores when we last computed the throughput
         */
        this.lastThroughputComputation = 0;
    }
}
