/* typehints:start */
import { ModInterface } from "./mod_interface";
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
     */
    constructor(metadata) {
        this.metadata = metadata;

        /**
         * @type {ModInterface}
         */
        this.interface = undefined;
    }

    hook_init() {}

    executeGuarded(taskName, task) {
        try {
            return task();
        } catch (ex) {
            console.error(ex);
            alert(
                "Mod " +
                    this.metadata.name +
                    " (version " +
                    this.metadata.version +
                    ")" +
                    " failed to execute '" +
                    taskName +
                    "':\n\n" +
                    ex +
                    "\n\nPlease forward this to the mod author:\n\n" +
                    this.metadata.authorName +
                    " (" +
                    this.metadata.authorContact +
                    ")"
            );
            throw ex;
        }
    }
}
