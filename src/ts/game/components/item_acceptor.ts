import { enumDirection, enumInvertedDirections, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
export type ItemAcceptorSlot = {
    pos: Vector;
    direction: enumDirection;
    filter?: ItemType;
};
export type ItemAcceptorLocatedSlot = {
    slot: ItemAcceptorSlot;
    index: number;
};
export type ItemAcceptorSlotConfig = {
    pos: Vector;
    direction: enumDirection;
    filter?: ItemType;
};



export class ItemAcceptorComponent extends Component {
    static getId() {
        return "ItemAcceptor";
    }

        constructor({ slots = [] }) {
        super();
        this.setSlots(slots);
        this.clear();
    }
    clear() {
        /**
         * Fixes belt animations
         */
        this.itemConsumptionAnimations = [];
    }
        setSlots(slots: Array<ItemAcceptorSlotConfig>) {
                this.slots = [];
        for (let i = 0; i < slots.length; ++i) {
            const slot = slots[i];
            this.slots.push({
                pos: slot.pos,
                direction: slot.direction,
                // Which type of item to accept (shape | color | all) @see ItemType
                filter: slot.filter,
            });
        }
    }
    /**
     * Returns if this acceptor can accept a new item at slot N
     *
     * NOTICE: The belt path ignores this for performance reasons and does his own check
     */
    canAcceptItem(slotIndex: number, item: BaseItem=) {
        const slot = this.slots[slotIndex];
        return !slot.filter || slot.filter === item.getItemType();
    }
    /**
     * Called when an item has been accepted so that
     */
    onItemAccepted(slotIndex: number, direction: enumDirection, item: BaseItem, remainingProgress: number = 0.0) {
        this.itemConsumptionAnimations.push({
            item,
            slotIndex,
            direction,
            animProgress: Math.min(1, remainingProgress * 2),
        });
    }
    /**
     * Tries to find a slot which accepts the current item
     * {}
     */
    findMatchingSlot(targetLocalTile: Vector, fromLocalDirection: enumDirection): ItemAcceptorLocatedSlot | null {
        // We need to invert our direction since the acceptor specifies *from* which direction
        // it accepts items, but the ejector specifies *into* which direction it ejects items.
        // E.g.: Ejector ejects into "right" direction but acceptor accepts from "left" direction.
        const desiredDirection = enumInvertedDirections[fromLocalDirection];
        // Go over all slots and try to find a target slot
        for (let slotIndex = 0; slotIndex < this.slots.length; ++slotIndex) {
            const slot = this.slots[slotIndex];
            // Make sure the acceptor slot is on the right position
            if (!slot.pos.equals(targetLocalTile)) {
                continue;
            }
            // Check if the acceptor slot accepts items from our direction
            if (desiredDirection === slot.direction) {
                return {
                    slot,
                    index: slotIndex,
                };
            }
        }
        return null;
    }
}
