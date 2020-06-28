import { Component } from "../component";
import { Vector, enumDirection } from "../../core/vector";
import { types } from "../../savegame/serialization";

/** @enum {string} */
export const enumPinSlotType = {
    positiveEnergyEjector: "positiveEnergyEjector",
    negativeEnergyEjector: "negativeEnergyEjector",
    positiveEnergyAcceptor: "positiveEnergyAcceptor",
    negativeEnergyAcceptor: "negativeEnergyAcceptor",
};

/** @typedef {{
 *   pos: Vector,
 *   type: enumPinSlotType,
 *   direction: enumDirection
 * }} WirePinSlotDefinition */

/** @typedef {{
 *   pos: Vector,
 *   type: enumPinSlotType,
 *   direction: enumDirection
 * }} WirePinSlot */

export class WiredPinsComponent extends Component {
    static getId() {
        return "WiredPins";
    }

    static getSchema() {
        return {
            slots: types.array(
                types.structured({
                    pos: types.vector,
                    type: types.enum(enumPinSlotType),
                })
            ),
        };
    }

    /**
     *
     * @param {object} param0
     * @param {Array<WirePinSlotDefinition>} param0.slots
     */
    constructor({ slots = [] }) {
        super();
        this.setSlots(slots);
    }

    /**
     * Sets the slots of this building
     * @param {Array<WirePinSlotDefinition>} slots
     */
    setSlots(slots) {
        /** @type {Array<WirePinSlot>} */
        this.slots = [];

        for (let i = 0; i < slots.length; ++i) {
            const slotData = slots[i];
            this.slots.push({
                pos: slotData.pos,
                type: slotData.type,
                direction: slotData.direction,
            });
        }
    }
}
