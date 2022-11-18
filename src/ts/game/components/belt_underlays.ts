import { enumDirection, Vector } from "../../core/vector";
import { Component } from "../component";
/**
 * Store which type an underlay is, this is cached so we can easily
 * render it.
 *
 * Full: Render underlay at top and bottom of tile
 * Bottom Only: Only render underlay at the bottom half
 * Top Only:
 * @enum {string}
 */
export const enumClippedBeltUnderlayType = {
    full: "full",
    bottomOnly: "bottomOnly",
    topOnly: "topOnly",
    none: "none",
};
export type BeltUnderlayTile = {
    pos: Vector;
    direction: enumDirection;
    cachedType?: enumClippedBeltUnderlayType;
};

export class BeltUnderlaysComponent extends Component {
    static getId() {
        return "BeltUnderlays";
    }
    public underlays = underlays;

        constructor({ underlays = [] }) {
        super();
    }
}
