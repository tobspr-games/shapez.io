/* typehints:start */
import { Application } from "../application";
import { ModLoader } from "./modloader";
/* typehints:end */

import { MOD_SIGNALS } from "./mod_signals";

export class Mod {
    /**
     *
     * @param {Application} app
     * @param {object} metadata
     * @param {string} metadata.name
     * @param {string} metadata.version
     * @param {string} metadata.author
     * @param {string} metadata.website
     * @param {string} metadata.description
     * @param {string} metadata.id
     *
     * @param {ModLoader} modLoader
     */
    constructor(app, metadata, modLoader) {
        this.app = app;
        this.metadata = metadata;
        this.modLoader = modLoader;

        this.signals = MOD_SIGNALS;
        this.modInterface = modLoader.modInterface;
    }

    init() {}
}
