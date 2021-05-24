import { types } from "../../savegame/serialization";
import { Component } from "../component";

export class ItemProducerComponent extends Component {
    static getId() {
        return "ItemProducer";
    }

    static getSchema() {
        return {
            type: types.string,
        };
    }
}
