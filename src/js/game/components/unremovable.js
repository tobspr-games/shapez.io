import { Component } from "../component";

export class UnremovableComponent extends Component {
    static getId() {
        return "Unremovable";
    }

    static getSchema() {
        return {};
    }

    duplicateWithoutContents() {
        return new UnremovableComponent();
    }
}
