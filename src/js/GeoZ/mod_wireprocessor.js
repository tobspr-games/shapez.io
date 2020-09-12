import { BaseItem } from "../game/base_item";
import { LogicGateSystem } from "../game/systems/logic_gate";

/**
 * Custom wire processor (logic gate/virtual processor)
 */
export class ModWireProcessor {
    /**
     * @returns {String}
     */
    static getType() {
        return this.prototype.constructor.name;
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @param {LogicGateSystem} system
     * @returns {Array<BaseItem>|BaseItem}
     */
    static compute(system, parameters) {
        abstract;
        return [];
    }
}
