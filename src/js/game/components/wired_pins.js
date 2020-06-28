import { Component } from "../component";
import { Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";

/** @enum {string} */
export const enumPinSlotType = {
    energyEjector: "energyEjector",
};

/** @typedef {{
 *   pos: Vector,
 *   type: enumPinSlotType
 * }} WirePinSlotDefinition */

/** @typedef {{
 *   pos: Vector,
 *   type: enumPinSlotType,
 *   value: number
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
                    value: types.float,
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
                value: 0.0,
            });
        }
    }
}
