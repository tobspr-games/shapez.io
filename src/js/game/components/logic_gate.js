import { Component } from "../component";

/** @enum {string} */
export const enumLogicGateType = {
    and: "and",
    not: "not",
    xor: "xor",
    or: "or",
    transistor: "transistor",
};

export class LogicGateComponent extends Component {
    static getId() {
        return "LogicGate";
    }

    duplicateWithoutContents() {
        return new LogicGateComponent({ type: this.type });
    }

    /**
     *
     * @param {object} param0
     * @param {enumLogicGateType=} param0.type
     */
    constructor({ type = enumLogicGateType.and }) {
        super();
        this.type = type;
    }
}
