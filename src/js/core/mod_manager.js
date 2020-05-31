import { ReadWriteProxy } from "./read_write_proxy";
import { ExplainedResult } from "./explained_result";
import { globalError, globalLog, globalWarn } from "./logging";
import { ModApi } from "./mod_api";
import { queryParamOptions } from "./query_parameters";

// When changing this, make sure to also migrate savegames since they store the installed mods!
/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   author: string,
 *   website: string,
 *   description: string,
 *   url: string,
 *   version: string,
 *   is_game_changing: boolean
 * }} ModData
 */

export class ModManager extends ReadWriteProxy {
    constructor(app) {
        super(app, "mods.bin");

        this.modApi = new ModApi(app);

        // Whether the mod manager needs a restart to reload all mods
        this.needsRestart = false;

        // The promise for the next mod
        this.nextModResolver = null;
        this.nextModRejector = null;
    }

    /////// BEGIN RW PROXY //////

    verify(data) {
        // Todo
        return ExplainedResult.good();
    }

    getDefaultData() {
        return {
            version: this.getCurrentVersion(),
            mods: [],
        };
    }

    getCurrentVersion() {
        return 1002;
    }

    migrate(data) {
        // Simply reset
        if (data.version < 1002) {
            data.mods = [];
            data.version = 1002;
        }
        return ExplainedResult.good();
    }

    initialize() {
        // Read and directly write latest data back
        return this.readAsync()
            .then(() => this.loadMods())
            .then(() => this.writeAsync());
    }

    save() {
        return this.writeAsync();
    }

    /////// END RW PROXY //////

    /**
     * Retursn whether there are any mods enabled
     */
    getHasModsEnabled() {
        return (
            this.getNumMods() > 0 ||
            this.modApi._loadedMods.length > 0 ||
            this.modApi._activeModInstances.length > 0
        );
    }

    /**
     * Retursn whether there are any mods enabled which change the game
     */
    getHasGameChangingModsInstalled() {
        return this.getMods().find(mod => mod.is_game_changing) != null;
    }

    /**
     * Returns whether a restart is required to apply all mods
     */
    getNeedsRestart() {
        return this.needsRestart;
    }

    /**
     * Checks if the given mods of the savegame differ from the
     * installed mods
     * @param {Array<ModData>} savegameMods
     */
    checkModsNeedSync(savegameMods) {
        if (this.needsRestart) {
            return true;
        }

        const ourString = this.getMods()
            .filter(m => m.is_game_changing)
            .map(m => m.url)
            .join("@@@");
        const savegameString = savegameMods
            .filter(m => m.is_game_changing)
            .map(m => m.url)
            .join("@@@");

        if (ourString === savegameString) {
            return false;
        }
        return true;
    }

    /**
     * Attempts to register a mod after it was loaded
     * @param {function} modCallback
     */
    attemptRegisterMod(modCallback) {
        assert(this.nextModResolver, "Got mod registration while mod promise was not expected");
        assert(this.nextModRejector, "Got mod registration while mod promise was not expected");

        try {
            modCallback(this.modApi);
        } catch (ex) {
            console.error("Mod failed to load:", ex);
            const rejector = this.nextModRejector;
            this.nextModResolver = null;
            this.nextModRejector = null;
            rejector(ex);
            return;
        }
        const resolver = this.nextModResolver;
        this.nextModResolver = null;
        this.nextModRejector = null;
        resolver();
    }

    /**
     * Attempts to load all mods
     */
    loadMods() {
        window.registerMod = mod => this.attemptRegisterMod(mod);

        // Load all mods
        let promise = Promise.resolve(null);

        const mods = this.getMods();
        for (let i = 0; i < mods.length; ++i) {
            const mod = mods[i];

            promise = promise.then(() => {
                return Promise.race([
                    new Promise((resolve, reject) => {
                        setTimeout(reject, 60 * 1000);
                    }),
                    fetch(mod.url, {
                        method: "GET",
                        cache: "no-cache",
                    }),
                ])
                    .then(res => res.text())
                    .catch(err => {
                        globalError(this, "Failed to load mod", mod.name, ":", err);
                        return Promise.reject(
                            "Downloading '" + mod.name + "' from '" + mod.url + "' timed out"
                        );
                    })
                    .then(modCode => {
                        return Promise.race([
                            new Promise((resolve, reject) => {
                                setTimeout(reject, 60 * 1000);
                            }),
                            new Promise((resolve, reject) => {
                                this.nextModResolver = resolve;
                                this.nextModRejector = reject;

                                // Make sure we don't get errors from mods
                                window.anyModLoaded = true;

                                const modScript = document.createElement("script");
                                modScript.textContent = modCode;
                                modScript.type = "text/javascript";
                                modScript.setAttribute("data-mod-name", mod.name);
                                modScript.setAttribute("data-mod-version", mod.version);
                                try {
                                    document.head.appendChild(modScript);
                                } catch (ex) {
                                    console.error("Failed to insert mod, bad js:", ex);
                                    this.nextModResolver = null;
                                    this.nextModRejector = null;
                                    reject("Mod is invalid");
                                }
                            }),
                        ]);
                    })
                    .catch(err => {
                        globalError(this, "Failed to initializing mod", mod.name, ":", err);
                        return Promise.reject("Initializing '" + mod.name + "' failed: " + err);
                    });
            });
        }

        promise = promise.catch(err => {
            this.needsRestart = true;
            throw err;
        });

        return promise;
    }

    /**
     * Returns all installed mods
     * @returns {Array<ModData>}
     */
    getMods() {
        if (queryParamOptions.modDeveloper) {
            return [
                {
                    name: "Local Testing Mod",
                    author: "nobody",
                    website: "http://example.com",
                    description:
                        "This will load the mod from localhost:8000. Make sure to read the modding docs!",
                    url: "http://localhost:8000/mod.js",
                    version: "1.0.0",
                    is_game_changing: false,
                    id: "local_dev",
                },
            ];
        }

        return this.currentData.mods;
    }

    /**
     * Returns the total number of mods
     * @returns {number}
     */
    getNumMods() {
        return this.getMods().length;
    }

    /**
     * Installs a new mod
     * @param {ModData} mod
     * @param {string} id
     * @returns {Promise<void>}
     */
    installMod(mod, id) {
        if (queryParamOptions.modDeveloper) {
            return Promise.reject("Can not install mods in developer mode");
        }

        // Check if a mod with the same name is already installed
        const mods = this.getMods();
        for (let i = 0; i < mods.length; ++i) {
            if (mods[i].name === mod.name) {
                return Promise.reject("A mod with the same name is already installed");
            }
        }

        this.currentData.mods.push(mod);

        // TODO: Check if this use of trackUiClick is okay.
        // Track download in the background
        return this.writeAsync()
            .then(() => this.app.analytics.trackUiClick("mod/" + id))
            .then(() => (this.needsRestart = true))
            .then(() => null);
    }

    /**
     * Attempts to synchronize the mods from the savegame
     * @param {Array<ModData>} savegameMods
     * @returns {Promise<void>}
     */
    syncModsFromSavegame(savegameMods) {
        // First, remove all game changing mods from ours
        let newMods = this.getMods().filter(mod => !mod.is_game_changing);

        // Now, push all game changing mods from the savegame
        const gamechangingMods = savegameMods.filter(mod => mod.is_game_changing);

        for (let i = 0; i < gamechangingMods.length; ++i) {
            newMods.push(gamechangingMods[i]);
        }

        this.currentData.mods = newMods;
        return this.writeAsync()
            .then(() => (this.needsRestart = true))
            .then(() => null);
    }

    /**
     * Finds a mod by its name
     * @param {string} name
     * @returns {ModData}
     */
    getModByName(name) {
        return this.getMods().find(m => m.name === name);
    }

    /**
     * Removes a mod
     * @returns {Promise<void>}
     */
    uninstallMod(name) {
        if (queryParamOptions.modDeveloper) {
            return Promise.reject("Can not uninstall mods in developer mode");
        }

        const mods = this.getMods();
        for (let i = 0; i < mods.length; ++i) {
            if (mods[i].name === name) {
                mods.splice(i, 1);
                return this.writeAsync()
                    .then(() => (this.needsRestart = true))
                    .then(() => null);
            }
        }
        return Promise.reject("Mod not found in installed mods");
    }
}
