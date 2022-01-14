import { createLogger } from "../core/logging";
import { Mod } from "./mod";
import { ModInterface } from "./mod_interface";
import { MOD_SIGNALS } from "./mod_signals";

const LOG = createLogger("mods");

export class ModLoader {
    constructor() {
        LOG.log("modloader created");

        /** @type {Mod[]} */
        this.mods = [];

        this.modInterface = new ModInterface(this);

        /** @type {((Object) => (new (Application, ModLoader) => Mod))[]} */
        this.modLoadQueue = [];

        this.initialized = false;

        this.signals = MOD_SIGNALS;

        this.registerMod(/** @type {any} */ (require("./demo_mod").default));
    }

    linkApp(app) {
        this.app = app;
    }

    initMods() {
        LOG.log("hook:init");

        let exports = {};

        if (G_IS_DEV || G_IS_STANDALONE) {
            const modules = require.context("../", true, /\.js$/);

            Array.from(modules.keys()).forEach(key => {
                // @ts-ignore
                const module = modules(key);
                for (const member in module) {
                    if (member === "default") {
                        continue;
                    }
                    if (exports[member]) {
                        throw new Error("Duplicate export of " + member);
                    }
                    Object.defineProperty(exports, member, {
                        get() {
                            return module[member];
                        },
                        set(v) {
                            module[member] = v;
                        },
                    });
                }
            });
        }

        this.initialized = true;
        this.modLoadQueue.forEach(modClass => {
            const mod = new (modClass(exports))(this.app, this);
            mod.init();
            this.mods.push(mod);
        });
        this.modLoadQueue = [];
        this.signals.postInit.dispatch();
    }

    /**
     *
     * @param {(Object) => (new (Application, ModLoader) => Mod)} mod
     */
    registerMod(mod) {
        if (this.initialized) {
            throw new Error("Mods are already initialized, can not add mod afterwards.");
        }
        this.modLoadQueue.push(mod);
    }
}

export const MODS = new ModLoader();
