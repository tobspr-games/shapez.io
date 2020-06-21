import { createLogger } from "../../core/logging.js";
import { SavegameInterface_V1002 } from "./1002.js";

const schema = require("./1003.json");
const logger = createLogger("savegame_interface/1003");

export class SavegameInterface_V1003 extends SavegameInterface_V1002 {
    getVersion() {
        return 1003;
    }

    getSchemaUncached() {
        return schema;
    }

    /**
     * @param {import("../savegame_typedefs.js").SavegameData} data
     */
    static migrate1002to1003(data) {
        logger.log("Migrating 1002 to 1003");
        const dump = data.dump;
        if (!dump) {
            return true;
        }

        dump.pinnedShapes = { shapes: [] };
    }
}
