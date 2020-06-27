import { enumDirection, enumInvertedDirections, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { BaseItem, enumItemType } from "../base_item";
import { Component } from "../component";

/** @typedef {{
 * pos: Vector,
 * directions: enumDirection[],
 * filter?: enumItemType
 * }} ItemAcceptorSlot */

/**
 * Contains information about a slot plus its location
 * @typedef {{
 *  slot: ItemAcceptorSlot,
 *  index: number,
 *  acceptedDirection: enumDirection
 * }} ItemAcceptorLocatedSlot */

export class ItemAcceptorComponent extends Component {
    static getId() {
        return "ItemAcceptor";
    }

    static getSchema() {
        return {
            slots: types.array(
                types.structured({
                    pos: types.vector,
                    directions: types.array(types.enum(enumDirection)),
                    filter: types.nullable(types.enum(enumItemType)),
                })
            ),
            animated: types.bool,
            beltUnderlays: types.array(
                types.structured({
                    pos: types.vector,
                    direction: types.enum(enumDirection),
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
                directions: slot.directions.slice(),
                filter: slot.filter,
            });
        }

        const beltUnderlaysCopy = [];
        for (let i = 0; i < this.beltUnderlays.length; ++i) {
            const underlay = this.beltUnderlays[i];
            beltUnderlaysCopy.push({
                pos: underlay.pos.copy(),
                direction: underlay.direction,
            });
        }

        return new ItemAcceptorComponent({
            slots: slotsCopy,
            beltUnderlays: beltUnderlaysCopy,
            animated: this.animated,
        });
    }

    /**
     *
     * @param {object} param0
     * @param {Array<{pos: Vector, directions: enumDirection[], filter?: enumItemType}>} param0.slots The slots from which we accept items
     * @param {boolean=} param0.animated Whether to animate item consumption
     * @param {Array<{pos: Vector, direction: enumDirection}>=} param0.beltUnderlays Where to render belt underlays
     */
    constructor({ slots = [], beltUnderlays = [], animated = true }) {
        super();

        this.animated = animated;

        /**
         * Fixes belt animations
         * @type {Array<{ item: BaseItem, slotIndex: number, animProgress: number, direction: enumDirection}>}
         */
        this.itemConsumptionAnimations = [];

        /* Which belt underlays to render */
        this.beltUnderlays = beltUnderlays;

        this.setSlots(slots);
    }

    /**
     *
     * @param {Array<{pos: Vector, directions: enumDirection[], filter?: enumItemType}>} slots
     */
    setSlots(slots) {
        /** @type {Array<{pos: Vector, directions: enumDirection[], filter?: enumItemType}>} */
        this.slots = [];
        for (let i = 0; i < slots.length; ++i) {
            const slot = slots[i];
            this.slots.push({
                pos: slot.pos,
                directions: slot.directions,

                // Which type of item to accept (shape | color | all) @see enumItemType
                filter: slot.filter,
            });
        }
    }

    /**
     * Returns if this acceptor can accept a new item at slot N
     * @param {number} slotIndex
     * @param {BaseItem=} item
     */
    canAcceptItem(slotIndex, item) {
        const slot = this.slots[slotIndex];
        return !slot.filter || slot.filter === item.getItemType();
    }

    /**
     * Called when an item has been accepted so that
     * @param {number} slotIndex
     * @param {enumDirection} direction
     * @param {BaseItem} item
     */
    onItemAccepted(slotIndex, direction, item) {
        if (this.animated) {
            this.itemConsumptionAnimations.push({
                item,
                slotIndex,
                direction,
                animProgress: 0.0,
            });
        }
    }

    /**
     * Tries to find a slot which accepts the current item
     * @param {Vector} targetLocalTile
     * @param {enumDirection} fromLocalDirection
     * @returns {ItemAcceptorLocatedSlot|null}
     */
    findMatchingSlot(targetLocalTile, fromLocalDirection) {
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
            for (let i = 0; i < slot.directions.length; ++i) {
                // const localDirection = targetStaticComp.localDirectionToWorld(slot.directions[l]);
                if (desiredDirection === slot.directions[i]) {
                    return {
                        slot,
                        index: slotIndex,
                        acceptedDirection: desiredDirection,
                    };
                }
            }
        }

        return null;
    }
}
