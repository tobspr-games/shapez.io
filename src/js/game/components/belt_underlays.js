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
    topCorner: "topCorner",
    bottomCorner: "bottomCorner",
    none: "none",
};

/**
 * @typedef {{
 *   pos: Vector,
 *   direction: enumDirection,
 *   corner?: boolean,
 *   cachedType?: enumClippedBeltUnderlayType
 * }} BeltUnderlayTile
 */

export class BeltUnderlaysComponent extends Component {
    static getId() {
        return "BeltUnderlays";
    }

    /**
     * @param {object} param0
     * @param {Array<BeltUnderlayTile>=} param0.underlays Where to render belt underlays
     */
    constructor({ underlays = [] }) {
        super();
        this.underlays = underlays;
    }
}
