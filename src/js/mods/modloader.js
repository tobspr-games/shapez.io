/* typehints:start */
import { Application } from "../application";
/* typehints:end */
import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { Mod } from "./mod";
import { ModInterface } from "./mod_interface";
import { MOD_SIGNALS } from "./mod_signals";

const LOG = createLogger("mods");

/**
 * @typedef {{
 *   name: string;
 *   version: string;
 *   author: string;
 *   website: string;
 *   description: string;
 *   id: string;
 * }} ModMetadata
 */

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

        /** @type {({ meta: ModMetadata, modClass: typeof Mod})[]} */
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
                    mods = await ipcRenderer.invoke("get-mods");
                }
                if (G_IS_DEV && globalConfig.debug.externalModUrl) {
                    const response = await fetch(globalConfig.debug.externalModUrl, {
                        method: "GET",
                    });
                    if (response.status !== 200) {
                        throw new Error(
                            "Failed to load " +
                                globalConfig.debug.externalModUrl +
                                ": " +
                                response.status +
                                " " +
                                response.statusText
                        );
                    }

                    mods.push(await response.text());
                }

                window.$shapez_registerMod = (modClass, meta) => {
                    if (this.modLoadQueue.some(entry => entry.meta.id === meta.id)) {
                        console.warn(
                            "Not registering mod",
                            meta,
                            "since a mod with the same id is already loaded"
                        );
                        return;
                    }
                    this.modLoadQueue.push({
                        modClass,
                        meta,
                    });
                };

                mods.forEach(modCode => {
                    modCode += `
                        if (typeof Mod !== 'undefined') {
                            if (typeof METADATA !== 'object') {
                                throw new Error("No METADATA variable found");
                            }
                            window.$shapez_registerMod(Mod, METADATA);
                        }
                    `;
                    try {
                        const func = new Function(modCode);
                        func();
                    } catch (ex) {
                        console.error(ex);
                        alert("Failed to parse mod (launch with --dev for more info): \n\n" + ex);
                    }
                });

                delete window.$shapez_registerMod;
            } catch (ex) {
                alert("Failed to load mods (launch with --dev for more info): \n\n" + ex);
            }
        }

        this.initialized = true;
        this.modLoadQueue.forEach(({ modClass, meta }) => {
            try {
                const mod = new modClass(this.app, this, meta);
                mod.init();
                this.mods.push(mod);
            } catch (ex) {
                console.error(ex);
                alert("Failed to initialize mods (launch with --dev for more info): \n\n" + ex);
            }
        });
        this.modLoadQueue = [];
    }
}

export const MODS = new ModLoader();
