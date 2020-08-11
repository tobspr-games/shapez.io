import { Component } from "../component";

/** @enum {string} */
export const enumWireType = {
    regular: "regular",
    turn: "turn",
    split: "split",
};

export class WireComponent extends Component {
    static getId() {
        return "Wire";
    }

    duplicateWithoutContents() {
        return new WireComponent({ type: this.type });
    }

    /**
     * @param {object} param0
     * @param {enumWireType?} param0.type
     */
    constructor({ type = enumWireType.regular }) {
        super();
        this.type = type;
    }
}
