import { Component } from "../component";
import { Vector, enumDirection, enumDirectionToAngle, enumInvertedDirections } from "../../core/vector";
import { BaseItem } from "../base_item";
import { ShapeItem } from "../items/shape_item";
import { ColorItem } from "../items/color_item";
import { types } from "../../savegame/serialization";

/**
 * @enum {string?}
 */
export const enumItemAcceptorItemFilter = {
    shape: "shape",
    color: "color",
    none: null,
};

/** @typedef {{
 * pos: Vector,
 * directions: enumDirection[],
 * filter?: enumItemAcceptorItemFilter
 * }} ItemAcceptorSlot */

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
                    filter: types.nullable(types.enum(enumItemAcceptorItemFilter)),
                })
            ),
        };
    }

    /**
     *
     * @param {object} param0
     * @param {Array<{pos: Vector, directions: enumDirection[], filter?: enumItemAcceptorItemFilter}>} param0.slots The slots from which we accept items
     */
    constructor({ slots = [] }) {
        super();

        this.setSlots(slots);
    }

    /**
     *
     * @param {Array<{pos: Vector, directions: enumDirection[], filter?: enumItemAcceptorItemFilter}>} slots
     */
    setSlots(slots) {
        /** @type {Array<{pos: Vector, directions: enumDirection[], filter?: enumItemAcceptorItemFilter}>} */
        this.slots = [];
        for (let i = 0; i < slots.length; ++i) {
            const slot = slots[i];
            this.slots.push({
                pos: slot.pos,
                directions: slot.directions,

                // Which type of item to accept (shape | color | all) @see enumItemAcceptorItemFilter
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
        switch (slot.filter) {
            case enumItemAcceptorItemFilter.shape: {
                return item instanceof ShapeItem;
            }
            case enumItemAcceptorItemFilter.color: {
                return item instanceof ColorItem;
            }
            default:
                return true;
        }
    }

    /**
     * Tries to find a slot which accepts the current item
     * @param {Vector} targetLocalTile
     * @param {enumDirection} fromLocalDirection
     * @returns {{
     *  slot: ItemAcceptorSlot,
     *  index: number,
     *  acceptedDirection: enumDirection
     * }|null}
     */
    findMatchingSlot(targetLocalTile, fromLocalDirection) {
        // We need to invert our direction since the acceptor specifies *from* which direction
        // it accepts items, but the ejector specifies *into* which direction it ejects items.
        // E.g.: Ejector ejects into "right" direction but acceptor accepts from "left" direction.
        const desiredDirection = enumInvertedDirections[fromLocalDirection];

        // Go over all slots and try to find a target slot
        for (let slotIndex = 0; slotIndex < this.slots.length; ++slotIndex) {
            const slot = this.slots[slotIndex];

            // const acceptorLocalPosition = targetStaticComp.applyRotationToVector(
            //   slot.pos
            // );

            // const acceptorGlobalPosition = acceptorLocalPosition.add(targetStaticComp.origin);

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

        // && this.canAcceptItem(slotIndex, ejectingItem)
        return null;
    }
}
