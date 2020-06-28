import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { ShapeItem } from "../items/shape_item";

const maxQueueSize = 4;

export const ENERGY_GENERATOR_EJECT_SLOT = 0;
export const ENERGY_GENERATOR_ACCEPT_SLOT = 4;

export class EnergyGeneratorComponent extends Component {
    static getId() {
        return "EnergyGenerator";
    }

    static getSchema() {
        return {
            requiredKey: types.nullable(types.string),
            itemsInQueue: types.uint,
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
     * @param {number} slot
     */
    tryTakeItem(item, slot) {
        if (slot === ENERGY_GENERATOR_ACCEPT_SLOT) {
            // this is the acceptor slot on the wires layer
            // just destroy it
            return true;
        } else {
            if (/** @type {ShapeItem} */ (item).definition.getHash() !== this.requiredKey) {
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
}
