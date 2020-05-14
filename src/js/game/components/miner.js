import { globalConfig } from "../../core/config";
import { types } from "../../savegame/serialization";
import { Component } from "../component";

export class MinerComponent extends Component {
    static getId() {
        return "Miner";
    }

    static getSchema() {
        return {
            lastMiningTime: types.ufloat,
        };
    }

    /**
     */
    constructor() {
        super();
        this.lastMiningTime = 0;
    }
}
