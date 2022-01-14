import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { getIPCRenderer } from "../core/utils";
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
    }

    linkApp(app) {
        this.app = app;
    }

    anyModsActive() {
        return this.mods.length > 0;
    }

    async initMods() {
        LOG.log("hook:init");

        if (G_IS_STANDALONE) {
            try {
                const mods = await getIPCRenderer().invoke("get-mods");

                mods.forEach(modCode => {
                    const registerMod = mod => {
                        this.modLoadQueue.push(mod);
                    };
                    // ugh
                    eval(modCode);
                });
            } catch (ex) {
                alert("Failed to load mods: " + ex);
            }
        } else if (G_IS_DEV) {
            if (globalConfig.debug.loadDevMod) {
                this.modLoadQueue.push(/** @type {any} */ (require("./dev_mod").default));
            }
        }

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
}

export const MODS = new ModLoader();
