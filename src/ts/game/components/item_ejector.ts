import { enumDirection, enumDirectionToVector, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { BeltPath } from "../belt_path";
import { Component } from "../component";
import { Entity } from "../entity";
import { typeItemSingleton } from "../item_resolver";
export type ItemEjectorSlot = {
    pos: Vector;
    direction: enumDirection;
    item: BaseItem;
    lastItem: BaseItem;
    progress: ?number;
    cachedDestSlot?: import("./item_acceptor").ItemAcceptorLocatedSlot;
    cachedBeltPath?: BeltPath;
    cachedTargetEntity?: Entity;
};

export class ItemEjectorComponent extends Component {
    static getId() {
        return "ItemEjector";
    }
    static getSchema() {
        // The cachedDestSlot, cachedTargetEntity fields are not serialized.
        return {
            slots: types.fixedSizeArray(types.structured({
                item: types.nullable(typeItemSingleton),
                progress: types.float,
            })),
        };
    }
    public renderFloatingItems = renderFloatingItems;

        constructor({ slots = [], renderFloatingItems = true }) {
        super();
        this.setSlots(slots);
    }
    clear() {
        for (const slot of this.slots) {
            slot.item = null;
            slot.lastItem = null;
            slot.progress = 0;
        }
    }
        setSlots(slots: Array<{
        pos: Vector;
        direction: enumDirection;
    }>) {
                this.slots = [];
        for (let i = 0; i < slots.length; ++i) {
            const slot = slots[i];
            this.slots.push({
                pos: slot.pos,
                direction: slot.direction,
                item: null,
                lastItem: null,
                progress: 0,
                cachedDestSlot: null,
                cachedTargetEntity: null,
            });
        }
    }
    /**
     * Returns where this slot ejects to
     * {}
     */
    getSlotTargetLocalTile(slot: ItemEjectorSlot): Vector {
        const directionVector = enumDirectionToVector[slot.direction];
        return slot.pos.add(directionVector);
    }
    /**
     * Returns whether any slot ejects to the given local tile
     */
    anySlotEjectsToLocalTile(tile: Vector) {
        for (let i = 0; i < this.slots.length; ++i) {
            if (this.getSlotTargetLocalTile(this.slots[i]).equals(tile)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Returns if we can eject on a given slot
     * {}
     */
    canEjectOnSlot(slotIndex: number): boolean {
        assert(slotIndex >= 0 && slotIndex < this.slots.length, "Invalid ejector slot: " + slotIndex);
        return !this.slots[slotIndex].item;
    }
    /**
     * Returns the first free slot on this ejector or null if there is none
     * {}
     */
    getFirstFreeSlot(): ?number {
        for (let i = 0; i < this.slots.length; ++i) {
            if (this.canEjectOnSlot(i)) {
                return i;
            }
        }
        return null;
    }
    /**
     * Tries to eject a given item
     * {}
     */
    tryEject(slotIndex: number, item: BaseItem): boolean {
        if (!this.canEjectOnSlot(slotIndex)) {
            return false;
        }
        this.slots[slotIndex].item = item;
        this.slots[slotIndex].lastItem = item;
        this.slots[slotIndex].progress = 0;
        return true;
    }
    /**
     * Clears the given slot and returns the item it had
     * {}
     */
    takeSlotItem(slotIndex: number): BaseItem | null {
        const slot = this.slots[slotIndex];
        const item = slot.item;
        slot.item = null;
        slot.progress = 0.0;
        return item;
    }
}
