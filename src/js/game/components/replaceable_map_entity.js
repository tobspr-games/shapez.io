import { Component } from "../component";

/**
 * Marks an entity as replaceable, so that when other buildings are placed above him it
 * simply gets deleted
 */
export class ReplaceableMapEntityComponent extends Component {
    static getId() {
        return "ReplaceableMapEntity";
    }
}
