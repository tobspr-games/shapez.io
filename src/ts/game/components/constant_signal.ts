import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";
export class ConstantSignalComponent extends Component {
    static getId() {
        return "ConstantSignal";
    }
    static getSchema() {
        return {
            signal: types.nullable(typeItemSingleton),
        };
    }
    /**
     * Copy the current state to another component
     */
    copyAdditionalStateTo(otherComponent: ConstantSignalComponent) {
        otherComponent.signal = this.signal;
    }
    public signal = signal;

        constructor({ signal = null }) {
        super();
    }
}
