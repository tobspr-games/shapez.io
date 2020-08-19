import { createLogger } from "../../core/logging";
import { SavegameInterface_V1004 } from "./1004";

const schema = require("./1005.json");
const logger = createLogger("savegame_interface/1005");

export class SavegameInterface_V1005 extends SavegameInterface_V1004 {
    getVersion() {
        return 1005;
    }

    getSchemaUncached() {
        return schema;
    }

    /**
     * @param {import("../savegame_typedefs.js").SavegameData} data
     */
    static migrate1004to1005(data) {
        logger.log("Migrating 1004 to 1005");
        const dump = data.dump;
        if (!dump) {
            return true;
        }

        // just reset belt paths for now
        dump.beltPaths = [];

        const entities = dump.entities;

        // clear ejector slots
        for (let i = 0; i < entities.length; ++i) {
            const entity = entities[i];
            const itemEjector = entity.components.ItemEjector;
            if (itemEjector) {
                const slots = itemEjector.slots;
                for (let k = 0; k < slots.length; ++k) {
                    const slot = slots[k];
                    slot.item = null;
                    slot.progress = 0;
                }
            }
        }
    }
}
