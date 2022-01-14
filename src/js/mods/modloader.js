import { createLogger } from "../core/logging";
import { Mod } from "./mod";
import { ModInterface } from "./mod_interface";
import { MetaBuilding } from "../game/meta_building";
import { MOD_SIGNALS } from "./mod_signals";

const LOG = createLogger("mods");

export class ModLoader {
    constructor() {
        LOG.log("modloader created");

        /** @type {Mod[]} */
        this.mods = [];

        this.modInterface = new ModInterface(this);

        /** @type {(new (ModLoader) => Mod)[]} */
        this.modLoadQueue = [];

        this.initialized = false;

        this.signals = MOD_SIGNALS;

        this.registerMod(
            /** @type {any} */ (require("./demo_mod").default({
                Mod,
                MetaBuilding,
            }))
        );
        this.initMods();
    }

    linkApp(app) {
        this.app = app;
    }

    initMods() {
        LOG.log("hook:init");
        this.initialized = true;
        this.modLoadQueue.forEach(modClass => {
            const mod = new modClass(this);
            mod.init();
            this.mods.push(mod);
        });
        this.modLoadQueue = [];
        this.signals.postInit.dispatch();
    }

    /**
     *
     * @param {new (ModLoader) => Mod} mod
     */
    registerMod(mod) {
        if (this.initialized) {
            throw new Error("Mods are already initialized, can not add mod afterwards.");
        }
        this.modLoadQueue.push(mod);
    }
}

export const MODS = new ModLoader();
