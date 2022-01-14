/* typehints:start */
import { ModLoader } from "./modloader";
/* typehints:end */

import { MOD_SIGNALS } from "./mod_signals";

export class Mod {
    /**
     *
     * @param {object} metadata
     * @param {string} metadata.name
     * @param {string} metadata.version
     * @param {string} metadata.authorName
     * @param {string} metadata.authorContact
     * @param {string} metadata.id
     *
     * @param {ModLoader} modLoader
     */
    constructor(metadata, modLoader) {
        this.metadata = metadata;
        this.modLoader = modLoader;

        this.signals = MOD_SIGNALS;
        this.modInterface = modLoader.modInterface;
    }

    init() {}
}
