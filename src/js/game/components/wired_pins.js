import { Component } from "../component";
import { Vector, enumDirection } from "../../core/vector";
import { types } from "../../savegame/serialization";

/** @enum {string} */
export const enumPinSlotType = {
    logicalEjector: "logicalEjector",
    logicalAcceptor: "logicalAcceptor",
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
