import { Component } from "../component";
/** @enum {string} */
export const enumWireType: any = {
    forward: "forward",
    turn: "turn",
    split: "split",
    cross: "cross",
};
/** @enum {string} */
export const enumWireVariant: any = {
    first: "first",
    second: "second",
};
export class WireComponent extends Component {
    static getId(): any {
        return "Wire";
    }
    public type = type;
    public variant: enumWireVariant = variant;
    public linkedNetwork: import("../systems/wire").WireNetwork = null;

        constructor({ type = enumWireType.forward, variant = enumWireVariant.first }) {
        super();
    }
}
