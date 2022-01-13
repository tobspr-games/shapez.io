import { Loader } from "../core/loader";
import { createLogger } from "../core/logging";
import { AtlasSprite } from "../core/sprites";
import { DemoMod } from "./demo_mod";
import { Mod } from "./mod";
import { ModInterface } from "./mod_interface";

const LOG = createLogger("mods");

export class ModLoader {
    constructor() {
        LOG.log("modloader created");

        /** @type {Mod[]} */
        this.mods = [];

        /** @type {Map<string, AtlasSprite>} */
        this.lazySprites = new Map();

        this.initialized = false;
    }

    linkApp(app) {
        this.app = app;
        this.mods.forEach(mod => (mod.interface.app = app));
    }

    hook_init() {
        LOG.log("hook:init");
        this.initialized = true;
        this.mods.forEach(mod => {
            LOG.log("Loading mod", mod.metadata.name);
            mod.interface = new ModInterface(this, mod);
            mod.executeGuarded("hook_init", mod.hook_init.bind(mod));
        });
    }

    hook_injectSprites() {
        LOG.log("hook:injectSprites");
        this.lazySprites.forEach((sprite, key) => {
            Loader.sprites.set(key, sprite);
            console.log("override", key);
        });
    }

    callHook(id, structuredArgs) {
        LOG.log("hook:" + id);
        this.mods.forEach(mod => {
            const handler = mod["hook_" + id];
            if (handler) {
                mod.executeGuarded("hook:" + id, handler.bind(mod, structuredArgs));
            }
        });
    }

    registerSprite() {}

    registerGameState() {}

    registerBuilding() {}

    /**
     *
     * @param {Mod} mod
     */
    registerMod(mod) {
        LOG.log("Registering mod", mod.metadata.name);
        if (this.initialized) {
            throw new Error("Mods are already initialized, can not add mod afterwards.");
        }
        this.mods.push(mod);
    }
}

export const MODS = new ModLoader();

MODS.registerMod(new DemoMod());
