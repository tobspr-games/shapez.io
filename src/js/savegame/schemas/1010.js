import { createLogger } from "../../core/logging.js";
import { SavegameInterface_V1009 } from "./1009.js";

const schema = require("./1010.json");
const logger = createLogger("savegame_interface/1010");

export class SavegameInterface_V1010 extends SavegameInterface_V1009 {
    getVersion() {
        return 1010;
    }

    getSchemaUncached() {
        return schema;
    }

    /**
     * @param {import("../savegame_typedefs.js").SavegameData} data
     */
    static migrate1009to1010(data) {
        logger.log("Migrating 1009 to 1010");
        const dump = data.dump;
        if (!dump) {
            return true;
        }

        if (!dump.map.hasOwnProperty("allowNonPrimaryColors")) {
            dump.map.allowNonPrimaryColors = false;
        }

        if (!dump.map.hasOwnProperty("fullShapePercentage")) {
            dump.map.fullShapePercentage = 0;
        }

        if (!dump.map.hasOwnProperty("wierdShapePercentage")) {
            dump.map.wierdShapePercentage = 0;
        }
    }
}
