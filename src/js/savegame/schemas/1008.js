import { createLogger } from "../../core/logging.js";
import { SavegameInterface_V1007 } from "./1007.js";

const schema = require("./1008.json");
const logger = createLogger("savegame_interface/1008");

export class SavegameInterface_V1008 extends SavegameInterface_V1007 {
    getVersion() {
        return 1008;
    }

    getSchemaUncached() {
        return schema;
    }

    /**
     * @param {import("../savegame_typedefs.js").SavegameData} data
     */
    static migrate1007to1008(data) {
        logger.log("Migrating 1007 to 1008");
        const dump = data.dump;
        if (!dump) {
            return true;
        }

        Object.assign(data.stats, {
            failedMam: true,
            trashedCount: 0,
            usedInverseRotater: true,
        });
    }
}
