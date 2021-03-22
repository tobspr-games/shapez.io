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

    /**
     * @param {object} options
     * @prop {type=} options.type
     */
    constructor({ type = enumItemProducerType.wired }) {
        super();
        this.type = type;
    }
}
