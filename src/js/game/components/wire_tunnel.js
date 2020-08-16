import { Component } from "../component";

export class WireTunnelComponent extends Component {
    static getId() {
        return "WireTunnel";
    }

    duplicateWithoutContents() {
        return new WireTunnelComponent({ multipleDirections: this.multipleDirections });
    }

    /**
     * @param {object} param0
     * @param {boolean=} param0.multipleDirections
     */
    constructor({ multipleDirections = true }) {
        super();
        this.multipleDirections = multipleDirections;

        /**
         * Linked network, only if its not multiple directions
         * @type {Array<import("../systems/wire").WireNetwork>}
         */
        this.linkedNetworks = [];
    }
}
