/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { StorageImplBrowserIndexedDB } from "../platform/browser/storage_indexed_db";
import { StorageImplElectron } from "../platform/electron/storage";
import { FILE_NOT_FOUND } from "../platform/storage";
import { Mod } from "./mod";
import { ModInterface } from "./mod_interface";
import { MOD_SIGNALS } from "./mod_signals";
import semverValidRange from "semver/ranges/valid";
import semverSatisifies from "semver/functions/satisfies";
const LOG: any = createLogger("mods");
export type ModMetadata = {
    name: string;
    version: string;
    author: string;
    website: string;
    description: string;
    id: string;
    minimumGameVersion?: string;
    settings: [
    ];
    doesNotAffectSavegame?: boolean;
};

export class ModLoader {
    public app: Application = undefined;
    public mods: Mod[] = [];
    public modInterface = new ModInterface(this);
    public modLoadQueue: ({
        meta: ModMetadata;
        modClass: typeof Mod;
    })[] = [];
    public initialized = false;
    public signals = MOD_SIGNALS;

    constructor() {
        LOG.log("modloader created");
    }
    linkApp(app: any): any {
        this.app = app;
    }
    anyModsActive(): any {
        return this.mods.length > 0;
    }
    
    getModsListForSavegame(): import("../savegame/savegame_typedefs").SavegameStoredMods {
        return this.mods
            .filter((mod: any): any => !mod.metadata.doesNotAffectSavegame)
            .map((mod: any): any => ({
            id: mod.metadata.id,
            version: mod.metadata.version,
            website: mod.metadata.website,
            name: mod.metadata.name,
            author: mod.metadata.author,
        }));
    }
    
    computeModDifference(originalMods: import("../savegame/savegame_typedefs").SavegameStoredMods): any {
        
        let missing: import("../savegame/savegame_typedefs").SavegameStoredMods = [];
        const current: any = this.getModsListForSavegame();
        originalMods.forEach((mod: any): any => {
            for (let i: any = 0; i < current.length; ++i) {
                const currentMod: any = current[i];
                if (currentMod.id === mod.id && currentMod.version === mod.version) {
                    current.splice(i, 1);
                    return;
                }
            }
            missing.push(mod);
        });
        return {
            missing,
            extra: current,
        };
    }
    exposeExports(): any {
        if (G_IS_DEV || G_IS_STANDALONE) {
            let exports: any = {};
            const modules: any = require.context("../", true, /\.js$/);
            Array.from(modules.keys()).forEach((key: any): any => {
                // @ts-ignore
                const module: any = modules(key);
                for (const member: any in module) {
                    if (member === "default" || member === "__$S__") {
                        // Setter
                        continue;
                    }
                    if (exports[member]) {
                        throw new Error("Duplicate export of " + member);
                    }
                    Object.defineProperty(exports, member, {
                        get(): any {
                            return module[member];
                        },
                        set(v: any): any {
                            module.__$S__(member, v);
                        },
                    });
                }
            });
            window.shapez = exports;
        }
    }
    async initMods(): any {
        if (!G_IS_STANDALONE && !G_IS_DEV) {
            this.initialized = true;
            return;
        }
        // Create a storage for reading mod settings
        const storage: any = G_IS_STANDALONE
            ? new StorageImplElectron(this.app)
            : new StorageImplBrowserIndexedDB(this.app);
        await storage.initialize();
        LOG.log("hook:init", this.app, this.app.storage);
        this.exposeExports();
        let mods: any = [];
        if (G_IS_STANDALONE) {
            mods = await ipcRenderer.invoke("get-mods");
        }
        if (G_IS_DEV && globalConfig.debug.externalModUrl) {
            const modURLs: any = Array.isArray(globalConfig.debug.externalModUrl)
                ? globalConfig.debug.externalModUrl
                : [globalConfig.debug.externalModUrl];
            for (let i: any = 0; i < modURLs.length; i++) {
                const response: any = await fetch(modURLs[i], {
                    method: "GET",
                });
                if (response.status !== 200) {
                    throw new Error("Failed to load " + modURLs[i] + ": " + response.status + " " + response.statusText);
                }
                mods.push(await response.text());
            }
        }
        window.$shapez_registerMod = (modClass: any, meta: any): any => {
            if (this.initialized) {
                throw new Error("Can't register mod after modloader is initialized");
            }
            if (this.modLoadQueue.some((entry: any): any => entry.meta.id === meta.id)) {
                console.warn("Not registering mod", meta, "since a mod with the same id is already loaded");
                return;
            }
            this.modLoadQueue.push({
                modClass,
                meta,
            });
        };
        mods.forEach((modCode: any): any => {
            modCode += `
                        if (typeof Mod !== 'undefined') {
                            if (typeof METADATA !== 'object') {
                                throw new Error("No METADATA variable found");
                            }
                            window.$shapez_registerMod(Mod, METADATA);
                        }
                    `;
            try {
                const func: any = new Function(modCode);
                func();
            }
            catch (ex: any) {
                console.error(ex);
                alert("Failed to parse mod (launch with --dev for more info): \n\n" + ex);
            }
        });
        delete window.$shapez_registerMod;
        for (let i: any = 0; i < this.modLoadQueue.length; i++) {
            const { modClass, meta }: any = this.modLoadQueue[i];
            const modDataFile: any = "modsettings_" + meta.id + "__" + meta.version + ".json";
            if (meta.minimumGameVersion) {
                const minimumGameVersion: any = meta.minimumGameVersion;
                if (!semverValidRange(minimumGameVersion)) {
                    alert("Mod " + meta.id + " has invalid minimumGameVersion: " + minimumGameVersion);
                    continue;
                }
                if (!semverSatisifies(G_BUILD_VERSION, minimumGameVersion)) {
                    alert("Mod  '" +
                        meta.id +
                        "' is incompatible with this version of the game: \n\n" +
                        "Mod requires version " +
                        minimumGameVersion +
                        " but this game has version " +
                        G_BUILD_VERSION);
                    continue;
                }
            }
            let settings: any = meta.settings;
            if (meta.settings) {
                try {
                    const storedSettings: any = await storage.readFileAsync(modDataFile);
                    settings = JSON.parse(storedSettings);
                }
                catch (ex: any) {
                    if (ex === FILE_NOT_FOUND) {
                        // Write default data
                        await storage.writeFileAsync(modDataFile, JSON.stringify(meta.settings));
                    }
                    else {
                        alert("Failed to load settings for " + meta.id + ", will use defaults:\n\n" + ex);
                    }
                }
            }
            try {
                const mod: any = new modClass({
                    app: this.app,
                    modLoader: this,
                    meta,
                    settings,
                    saveSettings: (): any => storage.writeFileAsync(modDataFile, JSON.stringify(mod.settings)),
                });
                await mod.init();
                this.mods.push(mod);
            }
            catch (ex: any) {
                console.error(ex);
                alert("Failed to initialize mods (launch with --dev for more info): \n\n" + ex);
            }
        }
        this.modLoadQueue = [];
        this.initialized = true;
    }
}
export const MODS: any = new ModLoader();
