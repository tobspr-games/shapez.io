import { enumDirection, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { BeltPath } from "../belt_path";
import { Component } from "../component";

export const curvedBeltLength = /* Math.PI / 4 */ 0.78;

/** @type {import("./item_acceptor").ItemAcceptorSlot} */
export const FAKE_BELT_ACCEPTOR_SLOT = {
    pos: new Vector(0, 0),
    direction: enumDirection.bottom,
};

/** @type {Object<enumDirection, import("./item_ejector").ItemEjectorSlot>} */
export const FAKE_BELT_EJECTOR_SLOT_BY_DIRECTION = {
    [enumDirection.top]: {
        pos: new Vector(0, 0),
        direction: enumDirection.top,
        item: null,
        progress: 0,
    },

    [enumDirection.right]: {
        pos: new Vector(0, 0),
        direction: enumDirection.right,
        item: null,
        progress: 0,
    },

    [enumDirection.left]: {
        pos: new Vector(0, 0),
        direction: enumDirection.left,
        item: null,
        progress: 0,
    },
};

export class BeltComponent extends Component {
    static getId() {
        return "Belt";
    }

    /**
     *
     * @param {object} param0
     * @param {enumDirection=} param0.direction The direction of the belt
     */
    constructor({ direction = enumDirection.top }) {
        super();

        this.direction = direction;

        /**
         * The path this belt is contained in, not serialized
         * @type {BeltPath}
         */
        this.assignedPath = null;
    }

    clear() {
        if (this.assignedPath) {
            this.assignedPath.clearAllItems();
        }
    }

    /**
     * Returns the effective length of this belt in tile space
     * @returns {number}
     */
    getEffectiveLengthTiles() {
        return this.direction === enumDirection.top ? 1.0 : curvedBeltLength;
    }

    /**
     * Returns fake acceptor slot used for matching
     * @returns {import("./item_acceptor").ItemAcceptorSlot}
     */
    getFakeAcceptorSlot() {
        return FAKE_BELT_ACCEPTOR_SLOT;
    }

    /**
     * Returns fake acceptor slot used for matching
     * @returns {import("./item_ejector").ItemEjectorSlot}
     */
    getFakeEjectorSlot() {
        assert(
            FAKE_BELT_EJECTOR_SLOT_BY_DIRECTION[this.direction],
            "Invalid belt direction: ",
            this.direction
        );
        return FAKE_BELT_EJECTOR_SLOT_BY_DIRECTION[this.direction];
    }

    /**
     * Converts from belt space (0 = start of belt ... 1 = end of belt) to the local
     * belt coordinates (-0.5|-0.5 to 0.5|0.5)
     * @param {number} progress
     * @returns {Vector}
     */
    transformBeltToLocalSpace(progress) {
        assert(progress >= 0.0, "Invalid progress ( < 0): " + progress);
        switch (this.direction) {
            case enumDirection.top:
                assert(progress <= 1.02, "Invalid progress: " + progress);
                return new Vector(0, 0.5 - progress);

            case enumDirection.right: {
                assert(progress <= curvedBeltLength + 0.02, "Invalid progress 2: " + progress);
                const arcProgress = (progress / curvedBeltLength) * 0.5 * Math.PI;
                return new Vector(0.5 - 0.5 * Math.cos(arcProgress), 0.5 - 0.5 * Math.sin(arcProgress));
            }
            case enumDirection.left: {
                assert(progress <= curvedBeltLength + 0.02, "Invalid progress 3: " + progress);
                const arcProgress = (progress / curvedBeltLength) * 0.5 * Math.PI;
                return new Vector(-0.5 + 0.5 * Math.cos(arcProgress), 0.5 - 0.5 * Math.sin(arcProgress));
            }
            default:
                assertAlways(false, "Invalid belt direction: " + this.direction);
                return new Vector(0, 0);
        }
    }
}
