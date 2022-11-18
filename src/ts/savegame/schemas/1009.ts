import { createLogger } from "../../core/logging.js";
import { RegularGameMode } from "../../game/modes/regular.js";
import { SavegameInterface_V1008 } from "./1008.js";
const schema = require("./1009.json");
const logger = createLogger("savegame_interface/1009");
export class SavegameInterface_V1009 extends SavegameInterface_V1008 {
    getVersion() {
        return 1009;
    }
    getSchemaUncached() {
        return schema;
    }
    
    static migrate1008to1009(data: import("../savegame_typedefs.js").SavegameData) {
        logger.log("Migrating 1008 to 1009");
        const dump = data.dump;
        if (!dump) {
            return true;
        }
        dump.gameMode = {
            mode: {
                id: RegularGameMode.getId(),
                data: {},
            },
        };
    }
}
