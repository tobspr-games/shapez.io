import { createLogger } from "../../core/logging.js";
import { SavegameInterface_V1006 } from "./1006.js";
const schema: any = require("./1007.json");
const logger: any = createLogger("savegame_interface/1007");
export class SavegameInterface_V1007 extends SavegameInterface_V1006 {
    getVersion(): any {
        return 1007;
    }
    getSchemaUncached(): any {
        return schema;
    }
    
    static migrate1006to1007(data: import("../savegame_typedefs.js").SavegameData): any {
        logger.log("Migrating 1006 to 1007");
        const dump: any = data.dump;
        if (!dump) {
            return true;
        }
        const waypoints: any = dump.waypoints.waypoints;
        // set waypoint layer to "regular"
        for (let i: any = 0; i < waypoints.length; ++i) {
            const waypoint: any = waypoints[i];
            waypoint.layer = "regular";
        }
    }
}
