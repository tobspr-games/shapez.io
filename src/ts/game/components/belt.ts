import { enumDirection, Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { BeltPath } from "../belt_path";
import { Component } from "../component";
export const curvedBeltLength: any = 0.78;
export const FAKE_BELT_ACCEPTOR_SLOT: import("./item_acceptor").ItemAcceptorSlot = {
    pos: new Vector(0, 0),
    direction: enumDirection.bottom,
};
export const FAKE_BELT_EJECTOR_SLOT_BY_DIRECTION: {
    [idx: enumDirection]: import("./item_ejector").ItemEjectorSlot;
} = {
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
    static getId(): any {
        return "Belt";
    }
    public direction = direction;
    public assignedPath: BeltPath = null;

        constructor({ direction = enumDirection.top }) {
        super();
    }
    clear(): any {
        if (this.assignedPath) {
            this.assignedPath.clearAllItems();
        }
    }
    /**
     * Returns the effective length of this belt in tile space
     * {}
     */
    getEffectiveLengthTiles(): number {
        return this.direction === enumDirection.top ? 1.0 : curvedBeltLength;
    }
    /**
     * Returns fake acceptor slot used for matching
     * {}
     */
    getFakeAcceptorSlot(): import("./item_acceptor").ItemAcceptorSlot {
        return FAKE_BELT_ACCEPTOR_SLOT;
    }
    /**
     * Returns fake acceptor slot used for matching
     * {}
     */
    getFakeEjectorSlot(): import("./item_ejector").ItemEjectorSlot {
        assert(FAKE_BELT_EJECTOR_SLOT_BY_DIRECTION[this.direction], "Invalid belt direction: ", this.direction);
        return FAKE_BELT_EJECTOR_SLOT_BY_DIRECTION[this.direction];
    }
    /**
     * Converts from belt space (0 = start of belt ... 1 = end of belt) to the local
     * belt coordinates (-0.5|-0.5 to 0.5|0.5)
     * {}
     */
    transformBeltToLocalSpace(progress: number): Vector {
        assert(progress >= 0.0, "Invalid progress ( < 0): " + progress);
        switch (this.direction) {
            case enumDirection.top:
                assert(progress <= 1.02, "Invalid progress: " + progress);
                return new Vector(0, 0.5 - progress);
            case enumDirection.right: {
                assert(progress <= curvedBeltLength + 0.02, "Invalid progress 2: " + progress);
                const arcProgress: any = (progress / curvedBeltLength) * 0.5 * Math.PI;
                return new Vector(0.5 - 0.5 * Math.cos(arcProgress), 0.5 - 0.5 * Math.sin(arcProgress));
            }
            case enumDirection.left: {
                assert(progress <= curvedBeltLength + 0.02, "Invalid progress 3: " + progress);
                const arcProgress: any = (progress / curvedBeltLength) * 0.5 * Math.PI;
                return new Vector(-0.5 + 0.5 * Math.cos(arcProgress), 0.5 - 0.5 * Math.sin(arcProgress));
            }
            default:
                assertAlways(false, "Invalid belt direction: " + this.direction);
                return new Vector(0, 0);
        }
    }
}
