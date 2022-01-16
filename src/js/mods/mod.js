/* typehints:start */
import { Application } from "../application";
import { ModLoader } from "./modloader";
/* typehints:end */

import { MOD_SIGNALS } from "./mod_signals";

export class Mod {
    /**
     * @param {Application} app
     * @param {ModLoader} modLoader
     * @param {import("./modloader").ModMetadata} meta
     */
    constructor(app, modLoader, meta) {
        this.app = app;
        this.modLoader = modLoader;
        this.metadata = meta;

        this.signals = MOD_SIGNALS;
        this.modInterface = modLoader.modInterface;
    }

    init() {
        // to be overridden
    }

    get dialogs() {
        return this.modInterface.dialogs;
    }
}
