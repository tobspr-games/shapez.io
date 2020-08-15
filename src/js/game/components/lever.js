import { Component } from "../component";

export class LeverComponent extends Component {
    static getId() {
        return "Lever";
    }

    duplicateWithoutContents() {
        return new LeverComponent({ toggled: this.toggled });
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
