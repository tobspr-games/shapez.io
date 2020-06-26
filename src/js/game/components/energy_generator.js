import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { ShapeItem } from "../items/shape_item";

const maxQueueSize = 10;

export class EnergyGeneratorComponent extends Component {
    static getId() {
        return "EnergyGenerator";
    }

    static getSchema() {
        return {
            requiredKey: types.string,
        };
    }

    /**
     *
     * @param {object} param0
     * @param {string} param0.requiredKey Which shape this generator needs, can be null if not computed yet
     */
    constructor({ requiredKey }) {
        super();
        this.requiredKey = requiredKey;

        /**
         * Stores how many items are ready to be converted to energy
         * @type {number}
         */
        this.itemsInQueue = 0;
    }

    /**
     *
     * @param {BaseItem} item
     */
    tryTakeItem(item) {
        if (!(item instanceof ShapeItem)) {
            // Not a shape
            return false;
        }

        if (item.definition.getHash() !== this.requiredKey) {
            // Not our shape
            return false;
        }

        if (this.itemsInQueue >= maxQueueSize) {
            // Queue is full
            return false;
        }

        // Take item and put it into the queue
        ++this.itemsInQueue;
        return true;
    }
}
