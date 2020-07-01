import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { Vector } from "../../core/vector";

export class EnergyConsumerComponent extends Component {
    static getId() {
        return "EnergyConsumer";
    }

    static getSchema() {
        return {
            bufferSize: types.uint,
            perCharge: types.uint,
            stored: types.uint,
            batteryPosition: types.vector,
        };
    }

    /**
     *
     * @param {object} param0
     * @param {number} param0.bufferSize How much energy this consumer can store
     * @param {number} param0.perCharge How much energy this consumer needs per charge
     * @param {Vector} param0.batteryPosition world space render offset of the battery icon
     */
    constructor({ bufferSize = 3, perCharge = 1, batteryPosition = new Vector() }) {
        super();
        this.bufferSize = bufferSize;
        this.perCharge = perCharge;
        this.batteryPosition = batteryPosition;

        this.stored = 0;
    }
}
