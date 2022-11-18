import { Component } from "../component";
/** @enum {string} */
export const enumLogicGateType: any = {
    and: "and",
    not: "not",
    xor: "xor",
    or: "or",
    transistor: "transistor",
    analyzer: "analyzer",
    rotater: "rotater",
    unstacker: "unstacker",
    cutter: "cutter",
    compare: "compare",
    stacker: "stacker",
    painter: "painter",
};
export class LogicGateComponent extends Component {
    static getId(): any {
        return "LogicGate";
    }
    public type = type;

        constructor({ type = enumLogicGateType.and }) {
        super();
    }
}
