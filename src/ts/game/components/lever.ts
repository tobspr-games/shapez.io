import { Component } from "../component";
import { types } from "../../savegame/serialization";
export class LeverComponent extends Component {
    static getId(): any {
        return "Lever";
    }
    static getSchema(): any {
        return {
            toggled: types.bool,
        };
    }
    /**
     * Copy the current state to another component
     */
    copyAdditionalStateTo(otherComponent: LeverComponent): any {
        otherComponent.toggled = this.toggled;
    }
    public toggled = toggled;

        constructor({ toggled = false }) {
        super();
    }
}
