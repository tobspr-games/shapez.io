import { Component } from "../component";
import { types } from "../../savegame/serialization";
export class LeverComponent extends Component {
    static getId() {
        return "Lever";
    }
    static getSchema() {
        return {
            toggled: types.bool,
        };
    }
    /**
     * Copy the current state to another component
     */
    copyAdditionalStateTo(otherComponent: LeverComponent) {
        otherComponent.toggled = this.toggled;
    }
    public toggled = toggled;

        constructor({ toggled = false }) {
        super();
    }
}
