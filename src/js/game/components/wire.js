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
     * @param {enumWireType=} param0.type
     */
    constructor({ type = enumWireType.regular }) {
        super();
        this.type = type;
    }

    /**
     * Returns the local connections
     * @returns {import("../../core/utils").DirectionalObject}
     */
    getLocalConnections() {
        switch (this.type) {
            case enumWireType.regular:
                return {
                    top: true,
                    right: false,
                    bottom: true,
                    left: false,
                };
            case enumWireType.turn:
                return {
                    top: false,
                    right: true,
                    bottom: true,
                    left: false,
                };
            case enumWireType.split:
                return {
                    top: false,
                    right: true,
                    bottom: true,
                    left: true,
                };

            default:
                assertAlways(false, "Invalid wire type: " + this.type);
        }
    }
}
