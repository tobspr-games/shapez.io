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
    static getId(): any {
        return "ItemAcceptor";
    }

        constructor({ slots = [] }) {
        super();
        this.setSlots(slots);
        this.clear();
    }
    clear(): any {
        /**
         * Fixes belt animations
         */
        this.itemConsumptionAnimations = [];
    }
        setSlots(slots: Array<ItemAcceptorSlotConfig>): any {
                this.slots = [];
        for (let i: any = 0; i < slots.length; ++i) {
            const slot: any = slots[i];
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
    canAcceptItem(slotIndex: number, item: BaseItem=): any {
        const slot: any = this.slots[slotIndex];
        return !slot.filter || slot.filter === item.getItemType();
    }
    /**
     * Called when an item has been accepted so that
     */
    onItemAccepted(slotIndex: number, direction: enumDirection, item: BaseItem, remainingProgress: number = 0.0): any {
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
        const desiredDirection: any = enumInvertedDirections[fromLocalDirection];
        // Go over all slots and try to find a target slot
        for (let slotIndex: any = 0; slotIndex < this.slots.length; ++slotIndex) {
            const slot: any = this.slots[slotIndex];
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
