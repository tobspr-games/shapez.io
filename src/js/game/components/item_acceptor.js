import { enumDirection, enumInvertedDirections, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";
import { isTruthyItem } from "../items/boolean_item";
import { typeItemSingleton } from "../item_resolver";
import { GameRoot } from "../root";

/**
 * @typedef {{
 * pos: Vector,
 * direction: enumDirection,
 * filter?: ItemType
 * }} ItemAcceptorSlot */

/**
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
 * }} ItemAcceptorSlotConfig */

/**
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

/** @enum {string} */
export const enumInputRequirements = {
    quadPainter: "quadPainter",
    storage: "storage",
};

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
     * @param {string|null=} param0.inputRequirement The requirement to accept items
     */
    constructor({ slots = [], maxSlotInputs = 2, inputRequirement = null }) {
        super();

        this.setSlots(slots);

        this.inputRequirement = inputRequirement;

        // setting this to 1 will cause throughput issues at very high speeds
        this.maxSlotInputs = maxSlotInputs;

        this.clear();
    }

    clear() {
        /** @type {ItemAcceptorInputs} */
        this.inputs = [];
        /** @type {ItemAcceptorCompletedInputs} */
        this.completedInputs = [];
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
     *
     * @param {Entity} entity
     * @param {BaseItem} item
     * @param {number} slotIndex
     * @returns
     */
    canAcceptItem(entity, item, slotIndex) {
        const slot = this.slots[slotIndex];

        // make sure there is a slot and we match the filter
        if (slot && !(slot.filter && slot.filter != item.getItemType())) {
            switch (this.inputRequirement) {
                case null: {
                    return true;
                }
                case enumInputRequirements.quadPainter: {
                    const pinsComp = entity.components.WiredPins;

                    if (slotIndex === 0) {
                        // Always accept the shape
                        return true;
                    }

                    // Check the network value at the given slot
                    const network = pinsComp.slots[slotIndex - 1].linkedNetwork;
                    const slotIsEnabled = network && network.hasValue() && isTruthyItem(network.currentValue);
                    if (!slotIsEnabled) {
                        return false;
                    }
                    return true;
                }
                case enumInputRequirements.storage: {
                    const storageComp = entity.components.Storage;

                    if (storageComp.storedCount >= storageComp.maximumStorage) {
                        return false;
                    }
                    const itemType = item.getItemType();
                    if (storageComp.storedItem && itemType !== storageComp.storedItem.getItemType()) {
                        return false;
                    }

                    // set the item straight away - this way different kinds of items can't be inq the acceptor
                    storageComp.storedItem = item;
                    storageComp.storedCount++;

                    return true;
                }
                default: {
                    assertAlways(false, "Input requirement is not recognised: " + slot.filter);
                    break;
                }
            }
        }
        return false;
    }

    /**
     * Called when trying to input a new item
     * @param {Entity} entity
     * @param {number} slotIndex
     * @param {BaseItem} item
     * @param {number} startProgress World space remaining progress, can be set to set the start position of the item
     * @returns {boolean} if the input was succesful
     */
    tryAcceptItem(entity, slotIndex, item, startProgress = 0.0) {
        // make sure we have space to actually accept
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
        if (!this.canAcceptItem(entity, item, slotIndex)) {
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
