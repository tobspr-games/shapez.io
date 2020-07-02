import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { Vector } from "../../core/vector";
import { BaseItem, enumItemTypeToLayer, enumItemType } from "../base_item";

export class EnergyConsumerComponent extends Component {
    static getId() {
        return "EnergyConsumer";
    }

    static getSchema() {
        return {
            bufferSize: types.float,
            perCharge: types.float,
            stored: types.float,
            piledOutput: types.float,
            batteryPosition: types.vector,
            energyType: types.enum(enumItemType),
            wasteType: types.enum(enumItemType),
            acceptorSlotIndex: types.uint,
            ejectorSlotIndex: types.uint,
        };
    }

    /**
     *
     * @param {object} param0
     * @param {number} param0.bufferSize How much energy this consumer can store
     * @param {number} param0.perCharge How much energy this consumer needs per charge
     * @param {Vector} param0.batteryPosition world space render offset of the battery icon
     * @param {number} param0.acceptorSlotIndex Which slot to accept energy on
     * @param {number} param0.ejectorSlotIndex Which slot to eject energy off
     *
     */
    constructor({
        bufferSize = 3,
        perCharge = 1,
        batteryPosition = new Vector(),
        acceptorSlotIndex = 0,
        ejectorSlotIndex = 0,
    }) {
        super();
        this.bufferSize = bufferSize;
        this.perCharge = perCharge;
        this.batteryPosition = batteryPosition;
        this.energyType = enumItemType.positiveEnergy;
        this.wasteType = enumItemType.negativeEnergy;
        this.acceptorSlotIndex = acceptorSlotIndex;
        this.ejectorSlotIndex = ejectorSlotIndex;

        /**
         * How much energy we have stored right now
         */
        this.stored = 0;

        /**
         * How much waste we have piled up so far
         */
        this.piledOutput = 0;
    }

    /**
     * Tries to accept a given item
     * @param {BaseItem} item
     * @param {number} slotIndex
     */
    tryAcceptItem(item, slotIndex) {
        if (slotIndex !== this.acceptorSlotIndex) {
            // Wrong slot
            return false;
        }

        if (item.getItemType() !== this.energyType) {
            // Not the right type
            return false;
        }

        if (this.stored >= this.bufferSize) {
            // We are full
            return false;
        }

        // All good, consume
        this.stored = Math.min(this.stored + 1, this.bufferSize);

        return true;
    }

    /**
     * Tries to start the next charge
     */
    tryStartNextCharge() {
        if (this.hasTooMuchWastePiled()) {
            // Too much waste remaining
            return false;
        }

        if (this.stored < this.perCharge) {
            // Not enough energy stored
            return false;
        }

        this.stored -= this.perCharge;
        this.piledOutput += this.perCharge;
        return true;
    }

    /**
     * Returns if there is too much waste piled
     */
    hasTooMuchWastePiled() {
        return this.piledOutput >= 1.0;
    }

    /**
     * Reduces the waste by the given amount
     * @param {number} amount
     */
    reduceWaste(amount) {
        this.piledOutput = Math.max(0, this.piledOutput - amount);
    }
}
