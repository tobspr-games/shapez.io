import * as GeoZ from "../../main";
import { Vector, enumDirection } from "../../../core/vector";
import { Entity } from "../../../game/entity";
import { ModProcessor, ProcessorParameters } from "../../mod_processor";
import { ShapeItem } from "../../../game/items/shape_item";
import { ShapeDefinition } from "../../../game/shape_definition";
import { ItemProcessorComponent } from "../../../game/components/item_processor";
import { ItemEjectorComponent } from "../../../game/components/item_ejector";
import { ItemAcceptorComponent } from "../../../game/components/item_acceptor";
import { ModWireProcessor } from "../../mod_wireprocessor";
import { BaseItem } from "../../../game/base_item";
import { LogicGateSystem } from "../../../game/systems/logic_gate";
import { BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON, isTruthyItem } from "../../../game/items/boolean_item";
import { enumPinSlotType, WiredPinsComponent } from "../../../game/components/wired_pins";
import { LogicGateComponent } from "../../../game/components/logic_gate";
import { defaultBuildingVariant } from "../../../game/meta_building";

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
            url:
                "https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/wires/boolean_false.png",
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

class MetaInvertedGatesBuilding extends GeoZ.MetaModBuilding {
    static getId() {
        return "NANDGate";
    }

    static getKeybinding() {
        return "0";
    }

    static getTranslations() {
        return {
            variants: {
                default: {
                    name: "NAND Gate",
                    description: "Test GeoZ building for custom wire processor",
                },
                NORGate: {
                    name: "NOR Gate",
                    description: "Test GeoZ building for custom wire processor",
                },
                XNORGate: {
                    name: "XNOR Gate",
                    description: "Test GeoZ building for custom wire processor",
                },
            },
            keybinding: "NAND Gate",
        };
    }

    static getVariants() {
        return ["NORGate", "XNORGate"];
    }

    constructor() {
        super("NANDGate");
    }

    getSilhouetteColor() {
        return "#89dc60";
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    getAvailableVariants() {
        return [...super.getAvailableVariants(null), ...MetaInvertedGatesBuilding.getVariants()];
    }

    /**
     * @returns {Layer}
     */
    getLayer() {
        return "wires";
    }

    /**
     * @returns {import("../../mod_building").BuildingSpriteMetas}
     */
    getSpriteMetas() {
        return {
            default: [
                {
                    normal: {
                        url:
                            "https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/buildings/logic_gate.png",
                        width: 192,
                        height: 192,
                    },
                    blueprint: {
                        url:
                            "https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/blueprints/logic_gate.png",
                        width: 192,
                        height: 192,
                    },
                },
            ],
            NORGate: [
                {
                    normal: {
                        url:
                            "https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/buildings/logic_gate-or.png",
                        width: 192,
                        height: 192,
                    },
                    blueprint: {
                        url:
                            "https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/blueprints/logic_gate-or.png",
                        width: 192,
                        height: 192,
                    },
                },
            ],
            XNORGate: [
                {
                    normal: {
                        url:
                            "https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/buildings/logic_gate-xor.png",
                        width: 192,
                        height: 192,
                    },
                    blueprint: {
                        url:
                            "https://raw.githubusercontent.com/Exund/shapez.io/master/res_raw/sprites/blueprints/logic_gate-xor.png",
                        width: 192,
                        height: 192,
                    },
                },
            ],
        };
    }

    /**
     * @param {Entity} entity
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        entity.components.LogicGate.type = enumInvertedGatesVariants[variant];
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new WiredPinsComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.right,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                ],
            })
        );

        entity.addComponent(new LogicGateComponent({ type: NANDGate.getType() }));
    }
}

const enumInvertedGatesVariants = {
    [defaultBuildingVariant]: "NANDGate",
};

for (const v of MetaInvertedGatesBuilding.getVariants()) {
    enumInvertedGatesVariants[v] = v;
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

class NANDGate extends ModWireProcessor {
    /**
     * @param {Array<BaseItem|null>} parameters
     * @param {LogicGateSystem} system
     * @returns {Array<BaseItem>|BaseItem}
     */
    static compute(system, parameters) {
        assert(parameters.length === 2, "bad parameter count for NAND");
        return isTruthyItem(parameters[0]) && isTruthyItem(parameters[1])
            ? BOOL_FALSE_SINGLETON
            : BOOL_TRUE_SINGLETON;
    }
}

class NORGate extends ModWireProcessor {
    /**
     * @param {Array<BaseItem|null>} parameters
     * @param {LogicGateSystem} system
     * @returns {Array<BaseItem>|BaseItem}
     */
    static compute(system, parameters) {
        assert(parameters.length === 2, "bad parameter count for NOR");
        return isTruthyItem(parameters[0]) || isTruthyItem(parameters[1])
            ? BOOL_FALSE_SINGLETON
            : BOOL_TRUE_SINGLETON;
    }
}

class XNORGate extends ModWireProcessor {
    /**
     * @param {Array<BaseItem|null>} parameters
     * @param {LogicGateSystem} system
     * @returns {Array<BaseItem>|BaseItem}
     */
    static compute(system, parameters) {
        assert(parameters.length === 2, "bad parameter count for XNOR");
        return isTruthyItem(parameters[0]) !== isTruthyItem(parameters[1])
            ? BOOL_FALSE_SINGLETON
            : BOOL_TRUE_SINGLETON;
    }
}

class VirtualStacker extends ModWireProcessor {
    /**
     * @param {Array<BaseItem|null>} parameters
     * @param {LogicGateSystem} system
     * @returns {Array<BaseItem>|BaseItem}
     */
    static compute(system, parameters) {
        const item1 = parameters[0];
        const item2 = parameters[0];
        if (!item1 || !item2 || item1.getItemType() !== "shape" || item2.getItemType() !== "shape") {
            return null;
        }

        const definition1 = /** @type {ShapeItem} */ (item1).definition;
        const definition2 = /** @type {ShapeItem} */ (item2).definition;
        const result = system.root.shapeDefinitionMgr.shapeActionStack(definition1, definition2);
        return system.root.shapeDefinitionMgr.getShapeItemFromDefinition(result);
    }
}

/**@type {GeoZ.Mod}*/
const test = {
    name: "test",
    buildings: [MetaTestBuilding, MetaInvertedGatesBuilding],
    processors: [SquareConverter],
    wireProcessors: [NANDGate, NORGate, XNORGate, VirtualStacker],
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
