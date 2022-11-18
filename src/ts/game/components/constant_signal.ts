import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";
export class ConstantSignalComponent extends Component {
    static getId(): any {
        return "ConstantSignal";
    }
    static getSchema(): any {
        return {
            signal: types.nullable(typeItemSingleton),
        };
    }
    /**
     * Copy the current state to another component
     */
    copyAdditionalStateTo(otherComponent: ConstantSignalComponent): any {
        otherComponent.signal = this.signal;
    }
    public signal = signal;

        constructor({ signal = null }) {
        super();
    }
}
