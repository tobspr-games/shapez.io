import { createLogger } from "../../core/logging.js";
import { SavegameInterface_V1002 } from "./1002.js";
const schema: any = require("./1003.json");
const logger: any = createLogger("savegame_interface/1003");
export class SavegameInterface_V1003 extends SavegameInterface_V1002 {
    getVersion(): any {
        return 1003;
    }
    getSchemaUncached(): any {
        return schema;
    }
    
    static migrate1002to1003(data: import("../savegame_typedefs.js").SavegameData): any {
        logger.log("Migrating 1002 to 1003");
        const dump: any = data.dump;
        if (!dump) {
            return true;
        }
        dump.pinnedShapes = { shapes: [] };
    }
}
