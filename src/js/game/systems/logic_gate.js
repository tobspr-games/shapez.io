import { LogicGateComponent, enumLogicGateType } from "../components/logic_gate";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BaseItem } from "../base_item";
import { enumPinSlotType } from "../components/wired_pins";
import { BOOL_TRUE_SINGLETON, BOOL_FALSE_SINGLETON, BooleanItem, isBooleanItem } from "../items/boolean_item";

export class LogicGateSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [LogicGateComponent]);

        this.boundOperations = {
            [enumLogicGateType.and]: this.compute_AND.bind(this),
            [enumLogicGateType.not]: this.compute_NOT.bind(this),
            [enumLogicGateType.xor]: this.compute_XOR.bind(this),
            [enumLogicGateType.or]: this.compute_OR.bind(this),
            [enumLogicGateType.transistor]: this.compute_IF.bind(this),
        };
    }

    update() {
        this.allEntities.forEach(entity => {
            const logicComp = entity.components.LogicGate;
            const slotComp = entity.components.WiredPins;

            const slotValues = [];

            for (let i = 0; i < slotComp.slots.length; ++i) {
                const slot = slotComp.slots[i];
                if (slot.type !== enumPinSlotType.logicalAcceptor) {
                    continue;
                }
                if (slot.linkedNetwork) {
                    slotValues.push(slot.linkedNetwork.currentValue);
                } else {
                    slotValues.push(null);
                }
            }

            const result = this.boundOperations[logicComp.type](slotValues);

            // @TODO: For now we hardcode the value to always be slot 0
            assert(
                slotValues.length === slotComp.slots.length - 1,
                "Bad slot config, should have N acceptor slots and 1 ejector"
            );
            assert(slotComp.slots[0].type === enumPinSlotType.logicalEjector, "Slot 0 should be ejector");

            slotComp.slots[0].value = result;
        });
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @returns {BooleanItem}
     */
    compute_AND(parameters) {
        assert(parameters.length === 2, "bad parameter count for AND");

        const [param1, param2] = parameters;

        if (!isBooleanItem(param1) || !isBooleanItem(param2)) {
            return BOOL_FALSE_SINGLETON;
        }

        return param1.value && param2.value ? BOOL_TRUE_SINGLETON : BOOL_FALSE_SINGLETON;
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @returns {BooleanItem}
     */
    compute_NOT(parameters) {
        const [item] = parameters;

        if (!item) {
            return BOOL_TRUE_SINGLETON;
        }

        if (!isBooleanItem(item)) {
            return BOOL_FALSE_SINGLETON;
        }

        return item.value ? BOOL_FALSE_SINGLETON : BOOL_TRUE_SINGLETON;
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @returns {BooleanItem}
     */
    compute_XOR(parameters) {
        assert(parameters.length === 2, "bad parameter count for XOR");

        const [param1, param2] = parameters;

        if (!isBooleanItem(param1) || !isBooleanItem(param2)) {
            return BOOL_FALSE_SINGLETON;
        }

        return param1.value ^ param2.value ? BOOL_TRUE_SINGLETON : BOOL_FALSE_SINGLETON;
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @returns {BooleanItem}
     */
    compute_OR(parameters) {
        assert(parameters.length === 2, "bad parameter count for OR");

        const [param1, param2] = parameters;

        if (!isBooleanItem(param1) || !isBooleanItem(param2)) {
            return BOOL_FALSE_SINGLETON;
        }

        return param1.value || param2.value ? BOOL_TRUE_SINGLETON : BOOL_FALSE_SINGLETON;
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @returns {BaseItem|null}
     */
    compute_IF(parameters) {
        assert(parameters.length === 2, "bad parameter count for IF");

        const [flag, item] = parameters;

        return isBooleanItem(flag) && flag.value ? item : null;
    }
}
