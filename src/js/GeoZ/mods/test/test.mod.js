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
					description: "Test GeoZ building"
				}
			}, 
			keybinding: "Test"
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

    getSpriteMeta() {
		return {url:"https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/wires/boolean_false.png", width: 64, height: 64};
	}

	setupEntityComponents() {}
}

/**@type {GeoZ.Mod}*/
const test = {
	name: "test",
	buildings: [MetaTestBuilding]
};

export default test;