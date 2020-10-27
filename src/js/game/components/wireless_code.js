import { enumDirection, Vector } from "../../core/vector";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { typeItemSingleton } from "../item_resolver";
import { gComponentRegistry } from "../../core/global_registries";

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

    getWirelessCode() {
        return this.wireless_code;
    }
}
