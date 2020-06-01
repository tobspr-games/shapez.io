import { Vector, enumDirection, enumDirectionToVector } from "../../core/vector";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { gItemRegistry } from "../../core/global_registries";

/**
 * @typedef {{
 *    pos: Vector,
 *    direction: enumDirection,
 *    item: BaseItem,
 *    progress: number?
 * }} ItemEjectorSlot
 */

export class ItemEjectorComponent extends Component {
    static getId() {
        return "ItemEjector";
    }

    static getSchema() {
        return {
            instantEject: types.bool,
            slots: types.array(
                types.structured({
                    pos: types.vector,
                    direction: types.enum(enumDirection),
                    item: types.nullable(types.obj(gItemRegistry)),
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
            instantEject: this.instantEject,
        });
    }

    /**
     *
     * @param {object} param0
     * @param {Array<{pos: Vector, direction: enumDirection}>=} param0.slots The slots to eject on
     * @param {boolean=} param0.instantEject If the ejection is instant
     */
    constructor({ slots = [], instantEject = false }) {
        super();

        // How long items take to eject
        this.instantEject = instantEject;

        this.setSlots(slots);
    }

    /**
     * @param {Array<{pos: Vector, direction: enumDirection}>} slots The slots to eject on
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
            });
        }
    }

    /**
     * Returns the amount of slots
     */
    getNumSlots() {
        return this.slots.length;
    }

    /**
     * Returns where this slot ejects to
     * @param {number} index
     * @returns {Vector}
     */
    getSlotTargetLocalTile(index) {
        const slot = this.slots[index];
        const directionVector = enumDirectionToVector[slot.direction];
        return slot.pos.add(directionVector);
    }

    /**
     * Returns whether any slot ejects to the given local tile
     * @param {Vector} tile
     */
    anySlotEjectsToLocalTile(tile) {
        for (let i = 0; i < this.slots.length; ++i) {
            if (this.getSlotTargetLocalTile(i).equals(tile)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns if slot # is currently ejecting
     * @param {number} slotIndex
     * @returns {boolean}
     */
    isSlotEjecting(slotIndex) {
        assert(slotIndex >= 0 && slotIndex < this.slots.length, "Invalid ejector slot: " + slotIndex);
        return !!this.slots[slotIndex].item;
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
     * Returns if any slot is ejecting
     * @returns {boolean}
     */
    isAnySlotEjecting() {
        for (let i = 0; i < this.slots.length; ++i) {
            if (this.slots[i].item) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns if any slot is free
     * @returns {boolean}
     */
    hasAnySlotFree() {
        for (let i = 0; i < this.slots.length; ++i) {
            if (this.canEjectOnSlot(i)) {
                return true;
            }
        }
        return false;
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
        this.slots[slotIndex].progress = this.instantEject ? 1 : 0;
        return true;
    }
}
