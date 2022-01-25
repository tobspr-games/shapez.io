import { enumDirection, enumInvertedDirections, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";
import { typeItemSingleton } from "../item_resolver";
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
 *  slot: ItemAcceptorSlot,
 *  index: number,
 * }} ItemAcceptorLocatedSlot */

/**
 * @typedef {{
 * pos: Vector,
 * direction: enumDirection,
 * filter?: ItemType
 * }} ItemAcceptorSlotConfig
 *
 * @typedef {Array<{
 * slotIndex: number,
 * item: BaseItem,
 * animProgress: number,
 * }>} ItemAcceptorInputs
 *
 * @typedef {Array<{
 * slotIndex: number,
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

    static getSchema() {
        return {
            inputs: types.array(
                types.structured({
                    slotIndex: types.uint,
                    item: typeItemSingleton,
                    animProgress: types.ufloat,
                })
            ),
            completedInputs: types.array(
                types.structured({
                    slotIndex: types.uint,
                    item: typeItemSingleton,
                    extraProgress: types.ufloat,
                })
            ),
        };
    }

    /**
     *
     * @param {object} param0
     * @param {Array<ItemAcceptorSlotConfig>} param0.slots The slots from which we accept items
     * @param {number=} param0.maxSlotInputs The maximum amount of items one slot can accept before it is full
     */
    constructor({ slots = [], maxSlotInputs = 2 }) {
        super();

        /** @type {ItemAcceptorInputs} */
        this.inputs = [];
        /** @type {ItemAcceptorCompletedInputs} */
        this.completedInputs = [];
        this.setSlots(slots);

        // setting this to 1 will cause throughput issues at very high speeds
        this.maxSlotInputs = maxSlotInputs;
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
     * @param {BaseItem} item
     * @param {number} startProgress World space remaining progress, can be set to set the start position of the item
     * @returns {boolean} if the input was succesful
     */
    tryAcceptItem(slotIndex, item, startProgress = 0.0) {
        const slot = this.slots[slotIndex];

        let existingInputs = 0;
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].slotIndex == slotIndex) {
                existingInputs++;
            }
        }
        for (let i = 0; i < this.completedInputs.length; i++) {
            if (this.completedInputs[i].slotIndex == slotIndex) {
                existingInputs++;
            }
        }

        if (existingInputs >= this.maxSlotInputs) {
            return false;
        }

        if (slot.filter && slot.filter != item.getItemType()) {
            return false;
        }

        // if the start progress is bigger than 0.5, the remainder should get passed on to the ejector
        this.inputs.push({
            slotIndex,
            item,
            animProgress: startProgress,
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
