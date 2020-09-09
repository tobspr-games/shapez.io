import { MetaModBuilding } from "./mod_building";
import { ModComponent } from "./mod_component";
import { ModItem } from "./mod_item";
import { ModProcessor } from "./mod_processor";
import { ModSystem, ModSystemWithFilter } from "./mod_system";
import { gComponentRegistry, gItemRegistry, gMetaBuildingRegistry } from "../core/global_registries";
import { GameSystemManager } from "../game/game_system_manager";
import { GameCore } from "../game/core";
import { createLogger } from "../core/logging";
import { registerBuildingVariant } from "../game/building_codes";
import { supportedBuildings } from "../game/hud/parts/buildings_toolbar";
import { KEYMAPPINGS, key } from "../game/key_action_mapper";
import { T } from "../translations";

export { MetaModBuilding } from "./mod_building";
export { ModComponent } from "./mod_component";
export { ModItem } from "./mod_item";
export { ModProcessor } from "./mod_processor";
export { ModSystem, ModSystemWithFilter } from "./mod_system";

/**
 * @typedef {Object} Mod
 * @property {String} name
 * @property {Array<typeof MetaModBuilding>=} buildings
 * @property {Array<typeof ModComponent>=} components
 * @property {Array<typeof ModItem>=} items
 * @property {Array<typeof ModProcessor>=} processors
 * @property {Array<typeof ModSystem | typeof ModSystemWithFilter>=} systems
 */

 const logger = createLogger("GeoZ");

/** @type {Array<Mod>} */
export const Mods = [];

/** @type {Array<typeof ModComponent>} */
export const ModComponents = [];

/** @type {Array<typeof ModSystem | typeof ModSystemWithFilter>} */
export const ModSystems = [];

/** @type {Object.<string, typeof ModProcessor>} */
export const ModProcessors = {};

/** @type {Array<typeof ModItem>} */
export const ModItems = [];

/** @type {Array<typeof MetaModBuilding>} */
export const ModBuildings = [];

const GameSystemManager_internalInitSystems_original = GameSystemManager.prototype.internalInitSystems;
GameSystemManager.prototype.internalInitSystems = function () {
    GameSystemManager_internalInitSystems_original.call(this);

    for (const system of ModSystems) {
        //add(system.getId(), system);
        const before = system.getUpdateBefore();
        const after = system.getUpdateAfter();
        const system_id = system.getId();
        let override = false;

        if (this.systems[system_id]) {
            logger.log(
                `⚠️ WARNING ⚠️ A system with the ID "${system_id}" already exists and will be overriden`
            );
            override = true;
        }
        this.systems[system_id] = new system(this.root);

        if (!override) {
            if (before) {
                const i = this.systemUpdateOrder.indexOf(before);
                if (i !== -1) {
                    this.systemUpdateOrder.splice(i, 0, system_id);
                    continue;
                }
                logger.log(
                    `⚠️ WARNING ⚠️ System "${before}" not found and so system "${system_id}" can't be updated before it`
                );
            }

            if (after) {
                const i = this.systemUpdateOrder.indexOf(after);
                if (i !== -1) {
                    this.systemUpdateOrder.splice(i + 1, 0, system_id);
                    continue;
                }
                logger.log(
                    `⚠️ WARNING ⚠️ System "${after}" not found and so system "${system_id}" can't be updated after it`
                );
            }
        }

        if (!this.systemUpdateOrder.includes(system_id)) {
            this.systemUpdateOrder.push(system_id);
        }

        if (override) {
            logger.log(`System "${system_id}" update order : ${this.systemUpdateOrder.indexOf(system_id)}`);
        }
    }
};

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
        let temp = await fetch(url);
        const text = await temp.text();
        const mod = /** @type {Mod} */ (eval(text));

        if (mod.name) {
            Mods.push(mod);
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
                ModProcessors[processor.getType()] = processor;
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
					registerBuildingVariant(`${base_id}-${variant}`, building);
				}

				supportedBuildings.push(building);

				KEYMAPPINGS.buildings[base_id] = { keyCode: key(building.getKeybinding()) };

				const translations = building.getTranslations();

				T.keybindings.mappings[base_id] = translations.keybinding;

				T.buildings[base_id] = {};
				for (const variant in translations.variants) {
					T.buildings[base_id][variant] = translations.variants[variant];
				}
            }
		}
		
		logger.log(mod_infos);
	}
	
	for (const categoryId in KEYMAPPINGS) {
		for (const mappingId in KEYMAPPINGS[categoryId]) {
			KEYMAPPINGS[categoryId][mappingId].id = mappingId;
		}
	}

    logger.log(`${Mods.length} mods loaded`);
}
