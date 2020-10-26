import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { typeItemSingleton } from "../item_resolver";

export class WirelessDisplayComponent extends Component {
    static getId() {
        return "WirelessDisplay";
    }

    static getWirelessCode() {
        return 0;
    }

    static getSchema() {
        return {
            signal: types.nullable(typeItemSingleton),
        };
    }

    /**
     * Copy the current state to another component
     * @param {WirelessDisplayComponent} otherComponent
     */
    copyAdditionalStateTo(otherComponent) {
        otherComponent.signal = this.signal;
    }

    /**
     *
     * @param {object} param0
     * @param {BaseItem=} param0.signal The signal to store
     */
    constructor({ signal = null }) {
        super();
        this.signal = signal;
    }
}


