import { enumDirection, Vector } from "../../core/vector";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { typeItemSingleton } from "../item_resolver";
/** @enum {string} */
export const enumPinSlotType = {
    logicalEjector: "logicalEjector",
    logicalAcceptor: "logicalAcceptor",
};
export type WirePinSlotDefinition = {
    pos: Vector;
    type: enumPinSlotType;
    direction: enumDirection;
};
export type WirePinSlot = {
    pos: Vector;
    type: enumPinSlotType;
    direction: enumDirection;
    value: BaseItem;
    linkedNetwork: import("../systems/wire").WireNetwork;
};


export class WiredPinsComponent extends Component {
    static getId() {
        return "WiredPins";
    }
    static getSchema() {
        return {
            slots: types.fixedSizeArray(types.structured({
                value: types.nullable(typeItemSingleton),
            })),
        };
    }

        constructor({ slots = [] }) {
        super();
        this.setSlots(slots);
    }
    /**
     * Sets the slots of this building
     */
    setSlots(slots: Array<WirePinSlotDefinition>) {
                this.slots = [];
        for (let i = 0; i < slots.length; ++i) {
            const slotData = slots[i];
            this.slots.push({
                pos: slotData.pos,
                type: slotData.type,
                direction: slotData.direction,
                value: null,
                linkedNetwork: null,
            });
        }
    }
}
