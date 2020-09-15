import { Component } from "../component";

export class DisplayComponent extends Component {
    static getId() {
        return "Display";
    }

    duplicateWithoutContents() {
        return new DisplayComponent();
    }
}
