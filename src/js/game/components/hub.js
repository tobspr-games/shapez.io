import { Component } from "../component";
import { ShapeDefinition } from "../shape_definition";
import { types } from "../../savegame/serialization";

export class HubComponent extends Component {
    static getId() {
        return "Hub";
    }

    static getSchema() {
        return {
            definitionsToAnalyze: types.array(types.knownType(ShapeDefinition)),
        };
    }

    constructor() {
        super();

        /**
         * Shape definitions in queue to be analyzed and counted towards the goal
         * @type {Array<ShapeDefinition>}
         */
        this.definitionsToAnalyze = [];
    }

    /**
     * @param {ShapeDefinition} definition
     */
    queueShapeDefinition(definition) {
        this.definitionsToAnalyze.push(definition);
    }
}
