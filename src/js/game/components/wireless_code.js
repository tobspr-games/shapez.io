import { Component } from "../component";
import { types } from "../../savegame/serialization";

export class WirelessCodeComponent extends Component {
    static getId() {
        return "WirelessCode";
    }

    static getSchema() {
        return {
            wireless_code: types.string
        };
    }

    /**
     *
     * @param {object} id
     */
    constructor(id) {
        super();
        this.wireless_code = id;
    }
}
