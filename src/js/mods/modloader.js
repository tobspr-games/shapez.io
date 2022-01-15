/* typehints:start */
import { Application } from "../application";
/* typehints:end */
import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
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

        window.registerMod = mod => {
            this.modLoadQueue.push(mod);
        };

        if (G_IS_STANDALONE || G_IS_DEV) {
            try {
                let mods = [];
                if (G_IS_STANDALONE) {
                    mods = await ipcRenderer.invoke("get-mods");
                }
                if (G_IS_DEV && globalConfig.debug.externalModUrl) {
                    const mod = await (
                        await fetch(globalConfig.debug.externalModUrl, {
                            method: "GET",
                        })
                    ).text();
                    mods.push(mod);
                }

                mods.forEach(modCode => {
                    const func = new Function(modCode);
                    func();
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

        delete window.registerMod;
    }
}

export const MODS = new ModLoader();
