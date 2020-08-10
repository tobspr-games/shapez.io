import { Component } from "../component";
import { ShapeDefinition } from "../shape_definition";
import { types } from "../../savegame/serialization";

export class HubComponent extends Component {
    static getId() {
        return "Hub";
    }
}
