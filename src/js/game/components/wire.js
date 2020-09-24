import { Component } from "../component";

/** @enum {string} */
export const enumWireType = {
    forward: "forward",
    turn: "turn",
    split: "split",
    cross: "cross",
};

/** @enum {string} */
export const enumWireVariant = {
    first: "first",
    second: "second",
};

export class WireComponent extends Component {
    static getId() {
        return "Wire";
    }

    /**
     * @param {object} param0
     * @param {enumWireType=} param0.type
     * @param {enumWireVariant=} param0.variant
     */
    constructor({ type = enumWireType.forward, variant = enumWireVariant.first }) {
        super();
        this.type = type;

        /**
         * The variant of the wire, different variants do not connect
         * @type {enumWireVariant}
         */
        this.variant = variant;

        /**
         * @type {import("../systems/wire").WireNetwork}
         */
        this.linkedNetwork = null;
    }
}
