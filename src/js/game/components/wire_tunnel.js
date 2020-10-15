import { Component } from "../component";

export class WireTunnelComponent extends Component {
    static getId() {
        return "WireTunnel";
    }

    constructor() {
        super();

        /**
         * Linked network, only if its not multiple directions
         * @type {Array<import("../systems/wire").WireNetwork>}
         */
        this.linkedNetworks = [];
    }
}
