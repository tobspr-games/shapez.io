import { createLogger } from "../../core/logging.js";
import { SavegameInterface_V1009 } from "./1009.js";
const schema: any = require("./1010.json");
const logger: any = createLogger("savegame_interface/1010");
export class SavegameInterface_V1010 extends SavegameInterface_V1009 {
    getVersion(): any {
        return 1010;
    }
    getSchemaUncached(): any {
        return schema;
    }
    
    static migrate1009to1010(data: import("../savegame_typedefs.js").SavegameData): any {
        logger.log("Migrating 1009 to 1010");
        data.mods = [];
        if (data.dump) {
            data.dump.modExtraData = {};
        }
    }
}
