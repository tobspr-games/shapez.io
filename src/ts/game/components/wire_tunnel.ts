import { Component } from "../component";
export class WireTunnelComponent extends Component {
    static getId(): any {
        return "WireTunnel";
    }
    public linkedNetworks: Array<import("../systems/wire").WireNetwork> = [];

    constructor() {
        super();
    }
}
