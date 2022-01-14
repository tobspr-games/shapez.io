/* typehints:start */
import { Application } from "../application";
/* typehints:end */

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

        /**
         * @type {Application}
         */
        this.app = undefined;

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

    exposeExports() {
        if (G_IS_DEV || G_IS_STANDALONE) {
            let exports = {};
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

            window.shapez = exports;
        }
    }

    async initMods() {
        LOG.log("hook:init");

        this.exposeExports();

        if (G_IS_STANDALONE || G_IS_DEV) {
            try {
                let mods = [];
                if (G_IS_STANDALONE) {
                    mods = await getIPCRenderer().invoke("get-mods");
                } else if (G_IS_DEV && globalConfig.debug.externalModUrl) {
                    const mod = await (
                        await fetch(globalConfig.debug.externalModUrl, {
                            method: "GET",
                        })
                    ).text();
                    mods.push(mod);
                }

                mods.forEach(modCode => {
                    window.registerMod = mod => {
                        this.modLoadQueue.push(mod);
                    };
                    // ugh
                    eval(modCode);
                    delete window.registerMod;
                });
            } catch (ex) {
                alert("Failed to load mods: " + ex);
            }
        }

        this.initialized = true;
        this.modLoadQueue.forEach(modClass => {
            const mod = new (modClass())(this.app, this);
            mod.init();
            this.mods.push(mod);
        });
        this.modLoadQueue = [];
        this.signals.postInit.dispatch();
    }
}

export const MODS = new ModLoader();
