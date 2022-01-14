import { createLogger } from "../core/logging";
import { Signal } from "../core/signal";
import { DemoMod } from "./demo_mod";
import { Mod } from "./mod";
import { ModInterface } from "./mod_interface";
import { BaseHUDPart } from "../game/hud/base_hud_part";

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

        this.signals = {
            postInit: new Signal(),
            injectSprites: new Signal(),
            preprocessTheme: /** @type {TypedSignal<[Object]>} */ (new Signal()),
            modifyLevelDefinitions: /** @type {TypedSignal<[Array[Object]]>} */ (new Signal()),

            hudElementInitialized: /** @type {TypedSignal<[BaseHUDPart]>} */ (new Signal()),
            hudElementFinalized: /** @type {TypedSignal<[BaseHUDPart]>} */ (new Signal()),
        };

        this.registerMod(DemoMod);
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
