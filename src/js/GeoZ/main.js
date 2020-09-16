//Mod imports
import { MetaModBuilding } from "./mod_building";
import { ModComponent } from "./mod_component";
import { ModItem } from "./mod_item";
import { ModProcessor } from "./mod_processor";
import { ModWireProcessor } from "./mod_wireprocessor";
import { ModSystem, ModSystemWithFilter } from "./mod_system";
import { keyCodeOf } from "./mod_utils";

//Game imports
import { gComponentRegistry, gItemRegistry, gMetaBuildingRegistry } from "../core/global_registries";
import { GameSystemManager } from "../game/game_system_manager";
import { GameCore } from "../game/core";
import { createLogger } from "../core/logging";
import { registerBuildingVariant } from "../game/building_codes";
import { supportedBuildings } from "../game/hud/parts/buildings_toolbar";
import { KEYMAPPINGS, key } from "../game/key_action_mapper";
import { T } from "../translations";
import { ShapeData, allShapeData, initShapes } from "../game/shapes";
import { globalConfig } from "../core/config";

export { MetaModBuilding } from "./mod_building";
export { ModComponent } from "./mod_component";
export { ModItem } from "./mod_item";
export { ModProcessor } from "./mod_processor";
export { ModWireProcessor } from "./mod_wireprocessor";
export { ModSystem, ModSystemWithFilter } from "./mod_system";

/**
 * @typedef {Object} Mod
 * @property {String} name
 * @property {Array<typeof MetaModBuilding>=} buildings
 * @property {Array<typeof ModComponent>=} components
 * @property {Array<typeof ModItem>=} items
 * @property {Array<typeof ModProcessor>=} processors
 * @property {Array<typeof ModWireProcessor>=} wireProcessors
 * @property {Array<typeof ModSystem | typeof ModSystemWithFilter>=} systems
 * @property {Array<ShapeData>=} shapes
 */

export const logger = createLogger("GeoZ");

/** @type {Array<Mod>} */
export const Mods = [];

/** @type {Array<typeof ModComponent>} */
export const ModComponents = [];

/** @type {Array<typeof ModSystem | typeof ModSystemWithFilter>} */
export const ModSystems = [];

/** @type {Object.<string, typeof ModProcessor>} */
export const ModProcessors = {};

/** @type {Object.<string, typeof ModWireProcessor>} */
export const ModWireProcessors = {};

/** @type {Array<typeof ModItem>} */
export const ModItems = [];

/** @type {Array<typeof MetaModBuilding>} */
export const ModBuildings = [];

/** @type {Array<ShapeData>} */
export const ModShapes = [];

// @ts-ignore
const webpack_require = require.context("../", true, /\.js$/);

const GeoZ = {
    Classes: {
        MetaModBuilding,
        ModComponent,
        ModItem,
        ModProcessor,
        ModSystem,
        ModSystemWithFilter,
    },

    require(module) {
        return webpack_require(`./${module}.js`);
    },
};

export async function initMods() {
    const style = "font-size: 35px; font-family: Arial;font-weight: bold; padding: 10px 0;";
    console.log(
        `%cGeo%cZ%c modloader\nby %cExund\n`,
        `${style} color: #aaa;`,
        `${style} color: #7f7;`,
        `${style} color: #aaa; font-size: 15px;`,
        "color: #ff4300"
    );

    // @ts-ignore
    window.GeoZ = GeoZ;

    // @ts-ignore
    const local_mods = require.context("./mods", true, /.*\.mod\.js/i);
    for (let key of local_mods.keys()) {
        let mod = /** @type {Mod} */ (local_mods(key).default);
        if (mod.name) {
            Mods.push(mod);
        }
    }

    const local_mods_count = Mods.length;
    logger.log(`${local_mods_count} local mods found`);

    /** @type {Array<string>} */
    let external_mods = [];
    let storage = localStorage.getItem("mods.external");

    if (storage) {
        external_mods = JSON.parse(storage);
    }

    for (const url of external_mods) {
        try {
            let temp = await fetch(url);
            const text = await temp.text();
            const mod = /** @type {Mod} */ (eval(text));

            if (mod.name) {
                Mods.push(mod);
            }
        } catch {
            logger.log(`🛑 Failed to load mod at : ${url}`);
        }
    }

    const external_mods_count = Mods.length - local_mods_count;
    logger.log(`${external_mods_count} external mods found`);

    for (const mod of Mods) {
        let mod_infos = `${mod.name} : `;
        if (mod.components) {
            mod_infos += `${mod.components.length} components, `;
            for (const component of mod.components) {
                ModComponents.push(component);
                gComponentRegistry.register(component);
            }
        }

        if (mod.systems) {
            mod_infos += `${mod.systems.length} systems, `;
            for (const system of mod.systems) {
                ModSystems.push(system);
            }
        }

        if (mod.processors) {
            mod_infos += `${mod.processors.length} processors, `;
            for (const processor of mod.processors) {
                const type = processor.getType();
                ModProcessors[type] = processor;
                globalConfig.buildingSpeeds[type] = processor.getBaseSpeed();
            }
        }

        if (mod.wireProcessors) {
            mod_infos += `${mod.wireProcessors.length} wire processors, `;
            for (const wireProcessor of mod.wireProcessors) {
                const type = wireProcessor.getType();
                ModWireProcessors[type] = wireProcessor;
            }
        }

        if (mod.items) {
            mod_infos += `${mod.items.length} items, `;
            for (const item of mod.items) {
                ModItems.push(item);
                gItemRegistry.register(item);
            }
        }

        if (mod.buildings) {
            mod_infos += `${mod.buildings.length} buildings, `;
            for (const building of mod.buildings) {
                ModBuildings.push(building);
                gMetaBuildingRegistry.register(building);
                const base_id = building.getId();
                registerBuildingVariant(base_id, building);

                for (const variant of building.getVariants()) {
                    registerBuildingVariant(`${base_id}-${variant}`, building, variant);
                }

                supportedBuildings.push(building);

                KEYMAPPINGS.buildings[base_id] = {
                    keyCode: keyCodeOf(building.getKeybinding()),
                    id: base_id,
                };

                const translations = building.getTranslations();

                T.keybindings.mappings[base_id] = translations.keybinding;

                T.buildings[base_id] = {};
                for (const variant in translations.variants) {
                    T.buildings[base_id][variant] = translations.variants[variant];
                }
            }
        }

        if (mod.shapes) {
            mod_infos += `${mod.shapes.length} shapes, `;
            for (const shape of mod.shapes) {
                ModShapes.push(shape);
                allShapeData[shape.id] = shape;
            }
        }

        logger.log(mod_infos);
    }

    initShapes();

    logger.log(`${Mods.length} mods loaded`);
}
