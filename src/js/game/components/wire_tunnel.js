import { Component } from "../component";

export class WireTunnelComponent extends Component {
    static getId() {
        return "WireTunnel";
    }

    duplicateWithoutContents() {
        return new WireTunnelComponent();
    }
}
