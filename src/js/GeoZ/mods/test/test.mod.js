import * as GeoZ from "../../main";
import { Vector, enumDirection } from "../../../core/vector";
import { Entity } from "../../../game/entity";
import { ModProcessor, ProcessorParameters } from "../../mod_processor";
import { ShapeItem } from "../../../game/items/shape_item";
import { ShapeDefinition } from "../../../game/shape_definition";
import { ItemProcessorComponent } from "../../../game/components/item_processor";
import { ItemEjectorComponent } from "../../../game/components/item_ejector";
import { ItemAcceptorComponent } from "../../../game/components/item_acceptor";

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

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: SquareConverter.getType(),
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        filter: "shape",
                    },
                ],
            })
        );
    }
}

class SquareConverter extends ModProcessor {
    /**
	 * @returns {Number}
	 */
	static getBaseSpeed() {
		return 0.5;
	}

	/**
	 * Process ther current item
	 * @param {ProcessorParameters} param0 
	 * @returns {Boolean} Whether to track the production towards the analytics
	 */
	static process({ outItems }) {
		outItems.push({ item: new ShapeItem(ShapeDefinition.fromShortKey("SuSuSuSu")) });
		return true;
	}
}

/**@type {GeoZ.Mod}*/
const test = {
    name: "test",
    buildings: [MetaTestBuilding],
    processors: [SquareConverter],
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
