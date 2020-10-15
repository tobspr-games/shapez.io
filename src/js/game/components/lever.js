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
     * @param {LeverComponent} otherComponent
     */
    copyAdditionalStateTo(otherComponent) {
        otherComponent.toggled = this.toggled;
    }

    /**
     * @param {object} param0
     * @param {boolean=} param0.toggled
     */
    constructor({ toggled = false }) {
        super();
        this.toggled = toggled;
    }
}
