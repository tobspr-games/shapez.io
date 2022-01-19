import { enumDirection, enumInvertedDirections, Vector } from "../../core/vector";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";
import { GameRoot } from "../root";

/**
 * @typedef {{
 * pos: Vector,
 * direction: enumDirection,
 * filter?: ItemType
 * }} ItemAcceptorSlot
 *
 * Contains information about a slot plus its location
 * @typedef {{
 * slot: ItemAcceptorSlot,
 * index: number,
 * acceptedDirection: enumDirection
 * }} ItemAcceptorLocatedSlot
 *
 * @typedef {{
 * pos: Vector,
 * direction: enumDirection,
 * filter?: ItemType
 * }} ItemAcceptorSlotConfig
 *
 * @typedef {Map<number, {
 * item: BaseItem,
 * animProgress: number,
 * direction: enumDirection
 * }>} ItemAcceptorInputs
 *
 * @typedef {Map<number, {
 * item: BaseItem,
 * extraProgress: number
 * }>} ItemAcceptorCompletedInputs
 *
 * @typedef {{
 * root: GameRoot,
 * entity: Entity,
 * item: BaseItem,
 * slotIndex: number,
 * extraProgress: number
 * }} InputCompletedArgs
 */

export class ItemAcceptorComponent extends Component {
    static getId() {
        return "ItemAcceptor";
    }

    /**
     *
     * @param {object} param0
     * @param {Array<ItemAcceptorSlotConfig>} param0.slots The slots from which we accept items
     * @param {number=} param0.lengthMultiplier Whether the acceptor is double the usual length
     */
    constructor({ slots = [], lengthMultiplier = 1 }) {
        super();

        /** @type {ItemAcceptorInputs} */
        this.inputs = new Map();
        /** @type {ItemAcceptorCompletedInputs} */
        this.completedInputs = new Map(); // @SENSETODO does this need to be saved?
        this.setSlots(slots);
        this.progressLength = 0.5 * lengthMultiplier;
    }

    /**
     *
     * @param {Array<ItemAcceptorSlotConfig>} slots
     */
    setSlots(slots) {
        /** @type {Array<ItemAcceptorSlot>} */
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
     * Called when trying to input a new item
     * @param {number} slotIndex
     * @param {enumDirection} direction
     * @param {BaseItem} item
     * @param {number} startProgress World space remaining progress, can be set to set the start position of the item
     * @returns {boolean} if the input was succesful
     */
    tryAcceptItem(slotIndex, direction, item, startProgress = 0.0) {
        const slot = this.slots[slotIndex];

        if (this.completedInputs.has(slotIndex) || (slot.filter && slot.filter != item.getItemType())) {
            return false;
        }

        this.inputs.set(slotIndex, {
            item,
            direction,
            animProgress: Math.min(this.progressLength, startProgress),
        });
        return true;
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

            if (desiredDirection === slot.direction) {
                return {
                    slot,
                    index: slotIndex,
                    acceptedDirection: desiredDirection,
                };
            }
        }

        return null;
    }
}
