import { gItemRegistry } from "../../core/global_registries";
import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { BaseItem } from "../base_item";
import { typeItemSingleton } from "../item_resolver";

/** @enum {string} */
export const enumConstantSignalType = {
    wired: "wired",
    wireless: "wireless",
};

export class ConstantSignalComponent extends Component {
    static getId() {
        return "ConstantSignal";
    }

    static getSchema() {
        return {
            type: types.string,
            signal: types.nullable(typeItemSingleton),
        };
    }

    /**
     * Copy the current state to another component
     * @param {ConstantSignalComponent} otherComponent
     */
    copyAdditionalStateTo(otherComponent) {
        otherComponent.signal = this.signal;
        otherComponent.type = this.type;
    }

    /**
     *
     * @param {object} param0
     * @param {string=} param0.type
     * @param {BaseItem=} param0.signal The signal to store
     */
    constructor({ signal = null, type = enumConstantSignalType.wired }) {
        super();
        this.signal = signal;
        this.type = type;
    }

    isWireless() {
        return this.type === enumConstantSignalType.wireless;
    }
}
