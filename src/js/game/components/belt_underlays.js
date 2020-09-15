import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { enumDirection, Vector } from "../../core/vector";

export class BeltUnderlaysComponent extends Component {
    static getId() {
        return "BeltUnderlays";
    }

    duplicateWithoutContents() {
        const beltUnderlaysCopy = [];
        for (let i = 0; i < this.underlays.length; ++i) {
            const underlay = this.underlays[i];
            beltUnderlaysCopy.push({
                pos: underlay.pos.copy(),
                direction: underlay.direction,
            });
        }

        return new BeltUnderlaysComponent({
            underlays: beltUnderlaysCopy,
        });
    }

    /**
     * @param {object} param0
     * @param {Array<{pos: Vector, direction: enumDirection}>=} param0.underlays Where to render belt underlays
     */
    constructor({ underlays }) {
        super();
        this.underlays = underlays;
    }
}
