import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { gItemRegistry } from "../../core/global_registries";
import { BaseItem } from "../base_item";
import { Vector, enumDirection } from "../../core/vector";
import { Math_PI, Math_sin, Math_cos } from "../../core/builtins";
import { globalConfig } from "../../core/config";

export class SorterComponent extends Component {
    static getId() {
        return "Sorter";
    }

    static getSchema() {
        return {
            filter: types.string,
            isfil: types.bool,
        };
    }
    constructor({
        filter = "CuCuCuCu",
        isfil = false,
    }) {
        super();

        this.filter = filter;
        this.isfil = isfil;
    }
}
