import { Component } from "../component";
import { Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";

/**
 * @typedef {import("../../core/vector").Direction} Direction
 *
 * @typedef {{
 *   pos: Vector,
 *   type: enumPinSlotType,
 *   direction: Direction
 * }} WirePinSlotDefinition
 *
 * @typedef {{
 *   pos: Vector,
 *   type: enumPinSlotType,
 *   direction: Direction
 * }} WirePinSlot */

/** @enum {string} */
export const enumPinSlotType = {
    positiveEnergyEjector: "positiveEnergyEjector",
    negativeEnergyEjector: "negativeEnergyEjector",
    positiveEnergyAcceptor: "positiveEnergyAcceptor",
    negativeEnergyAcceptor: "negativeEnergyAcceptor",
};

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

    duplicateWithoutContents() {
        const slots = [];
        for (let i = 0; i < this.slots.length; ++i) {
            const slot = this.slots[i];
            slots.push({
                pos: slot.pos.copy(),
                type: slot.type,
                direction: slot.direction,
            });
        }

        return new WiredPinsComponent({ slots });
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
