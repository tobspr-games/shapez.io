import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { BaseItem } from "../base_item";
import { ShapeDefinition } from "../shape_definition";


export class BufferComponent extends Component {
    static getId() {
        return "Buffer";
    }

    static getSchema() {
        return {
            itemCount: types.uint,
            storageLimit: types.uint,
            // TODO: Is this the right type for an item definition?
            definition: types.nullable(types.knownType(ShapeDefinition)),
        };
    }

    /**
     */
    constructor() {
        super();

        this.itemCount = 0;
        // TODO: Make buffer storage a level up reward
        this.storageLimit = 5000;

        this.definition = null;
    }

    // TODO: Is this function needed?
    /**
     *
     * @param {BaseItem} item
     */
    tryAcceptChainedItem(item) {
        return false;
    }
}
