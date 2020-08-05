import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { ShapeItem } from "../items/shape_item";

const maxQueueSize = 4;

export class EnergyGeneratorComponent extends Component {
    static getId() {
        return "EnergyGenerator";
    }

    static getSchema() {
        return {
            requiredKey: types.nullable(types.string),
            itemsInQueue: types.uint,
            wasteAcceptorSlotIndex: types.uint,
        };
    }

    duplicateWithoutContents() {
        return new EnergyGeneratorComponent({
            requiredKey: null,
            wasteAcceptorSlotIndex: this.wasteAcceptorSlotIndex,
        });
    }

    /**
     *
     * @param {object} param0
     * @param {string=} param0.requiredKey Which shape this generator needs, can be null if not computed yet
     * @param {number} param0.wasteAcceptorSlotIndex Which slot accepts the waste
     */
    constructor({ requiredKey, wasteAcceptorSlotIndex = 0 }) {
        super();
        this.requiredKey = requiredKey;

        /**
         * Stores how many items are ready to be converted to energy
         * @type {number}
         */
        this.itemsInQueue = 0;

        /**
         * Stores which slot accepts the waste
         * @type {number}
         */
        this.wasteAcceptorSlotIndex = wasteAcceptorSlotIndex;
    }

    /**
     *
     * @param {BaseItem} item
     * @param {number} slot
     */
    tryTakeItem(item, slot) {
        if (slot === this.wasteAcceptorSlotIndex) {
            // this is the acceptor slot on the wires layer
            // just destroy it
            return true;
        } else {
            if (item.getItemType() !== "shape") {
                // This shouldn't happen since we have a filter - still, it doesn't hurt
                // to check either
                assertAlways(
                    false,
                    "Energy generator took wrong item: " +
                        item.getItemType() +
                        " on slot " +
                        slot +
                        " (waste slot = " +
                        this.wasteAcceptorSlotIndex +
                        ")"
                );
                return false;
            }

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
