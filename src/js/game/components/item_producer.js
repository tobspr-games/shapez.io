import { types } from "../../savegame/serialization";
import { Component } from "../component";

/** @enum {string} */
export const enumItemProducerType = {
    wired: "wired",
    wireless: "wireless",
};

export class ItemProducerComponent extends Component {
    static getId() {
        return "ItemProducer";
    }

    static getSchema() {
        return {
            type: types.string,
        };
    }

    /**
     * @param {object} param0
     * @param {string=} param0.type
     */
    constructor({ type = enumItemProducerType.wired }) {
        super();
        this.type = type;
    }

    isWireless() {
        return this.type === enumItemProducerType.wireless;
    }
}
