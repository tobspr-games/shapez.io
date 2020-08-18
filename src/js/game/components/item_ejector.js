import { directionVectorMap, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { BeltPath } from "../belt_path";
import { Component } from "../component";
import { Entity } from "../entity";
import { typeItemSingleton } from "../item_resolver";

/**
 * @typedef {import("./item_acceptor").ItemAcceptorLocatedSlot} ItemAcceptorLocatedSlot
 * @typedef {{
 *    pos: Vector,
 *    direction: Direction,
 *    item: BaseItem,
 *    progress: number?,
 *    cachedDestSlot?: import("./item_acceptor").ItemAcceptorLocatedSlot,
 *    cachedBeltPath?: BeltPath,
 *    cachedTargetEntity?: Entity
 * }} ItemEjectorSlot
 */

export class ItemEjectorComponent extends Component {
    static getId() {
        return "ItemEjector";
    }

    static getSchema() {
        // The cachedDestSlot, cachedTargetEntity fields are not serialized.
        return {
            slots: types.array(
                types.structured({
                    item: types.nullable(typeItemSingleton),
                    progress: types.float,
                })
            ),
        };
    }

    duplicateWithoutContents() {
        const slotsCopy = [];
        for (let i = 0; i < this.slots.length; ++i) {
            const slot = this.slots[i];
            slotsCopy.push({
                pos: slot.pos.copy(),
                direction: slot.direction,
            });
        }

        return new ItemEjectorComponent({
            slots: slotsCopy,
        });
    }

    /**
     *
     * @param {object} param0
     * @param {Array<{pos: Vector, direction: Direction }>=} param0.slots The slots to eject on
     */
    constructor({ slots = [] }) {
        super();

        this.setSlots(slots);

        /**
         * Whether this ejector slot is enabled
         */
        this.enabled = true;
    }

    /**
     * @param {Array<{pos: Vector, direction: Direction }>} slots The slots to eject on
     */
    setSlots(slots) {
        /** @type {Array<ItemEjectorSlot>} */
        this.slots = [];
        for (let i = 0; i < slots.length; ++i) {
            const slot = slots[i];
            this.slots.push({
                pos: slot.pos,
                direction: slot.direction,
                item: null,
                progress: 0,
                cachedDestSlot: null,
                cachedTargetEntity: null,
            });
        }
    }

    /**
     * Returns where this slot ejects to
     * @param {ItemEjectorSlot} slot
     * @returns {Vector}
     */
    getSlotTargetLocalTile(slot) {
        const directionVector = directionVectorMap[slot.direction];
        return slot.pos.add(directionVector);
    }

    /**
     * Returns whether any slot ejects to the given local tile
     * @param {Vector} tile
     */
    anySlotEjectsToLocalTile(tile) {
        for (let i = 0; i < this.slots.length; ++i) {
            if (this.getSlotTargetLocalTile(this.slots[i]).equals(tile)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns if we can eject on a given slot
     * @param {number} slotIndex
     * @returns {boolean}
     */
    canEjectOnSlot(slotIndex) {
        assert(slotIndex >= 0 && slotIndex < this.slots.length, "Invalid ejector slot: " + slotIndex);
        return !this.slots[slotIndex].item;
    }

    /**
     * Returns the first free slot on this ejector or null if there is none
     * @returns {number?}
     */
    getFirstFreeSlot() {
        for (let i = 0; i < this.slots.length; ++i) {
            if (this.canEjectOnSlot(i)) {
                return i;
            }
        }
        return null;
    }

    /**
     * Tries to eject a given item
     * @param {number} slotIndex
     * @param {BaseItem} item
     * @returns {boolean}
     */
    tryEject(slotIndex, item) {
        if (!this.canEjectOnSlot(slotIndex)) {
            return false;
        }
        this.slots[slotIndex].item = item;
        this.slots[slotIndex].progress = 0;
        return true;
    }

    /**
     * Clears the given slot and returns the item it had
     * @param {number} slotIndex
     * @returns {BaseItem|null}
     */
    takeSlotItem(slotIndex) {
        const slot = this.slots[slotIndex];
        const item = slot.item;
        slot.item = null;
        slot.progress = 0.0;
        return item;
    }
}
