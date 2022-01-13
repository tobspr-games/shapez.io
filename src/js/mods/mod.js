/* typehints:start */
import { ModLoader } from "./modloader";
/* typehints:end */

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
    }

    init() {}
}
