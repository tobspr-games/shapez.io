import { Component } from "../component";

export class ItemProducerComponent extends Component {
    static getId() {
        return "ItemProducer";
    }

    constructor() {
        super();

        /** @type {number} */
        this.lastOutputTime = 0;
    }
}
