import * as GeoZ from "../../main";
import { Vector } from "../../../core/vector";
import { Entity } from "../../../game/entity";

class MetaTestBuilding extends GeoZ.MetaModBuilding {
    static getId() {
        return "test";
    }

    static getKeybinding() {
        return "0";
    }

    static getTranslations() {
        return {
            variants: {
                default: {
                    name: "Test",
                    description: "Test GeoZ building",
                },
            },
            keybinding: "Test",
        };
    }

    constructor() {
        super("test");
    }

    getSilhouetteColor() {
        return "#ff00ff";
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    /**
     * @returns {import("../../mod_building").BuildingSpriteMetas}
     */
    getSpriteMetas() {
        const normal = {
            url: "https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/wires/boolean_false.png",
            width: 64,
            height: 64,
        };

        return {
            default: [
                {
                    normal,
                    blueprint: normal,
                },
            ],
        };
    }

    setupEntityComponents() {}
}

/**@type {GeoZ.Mod}*/
const test = {
    name: "test",
    buildings: [MetaTestBuilding],
    shapes: [
        {
            id: "leaf",
            code: "F",
            draw: "M 0 0 v 0.5 a 0.5 0.5 0 0 0 0.5 0.5 h 0.5 v -0.5 a 0.5 0.5 0 0 0 -0.5 -0.5 z",
            tier: 2,
            spawnData: {
                color: "yellow",
            },
        },
    ],
};

export default test;
