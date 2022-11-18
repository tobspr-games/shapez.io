import { createLogger } from "../../core/logging.js";
import { SavegameInterface_V1003 } from "./1003.js";
const schema: any = require("./1004.json");
const logger: any = createLogger("savegame_interface/1004");
export class SavegameInterface_V1004 extends SavegameInterface_V1003 {
    getVersion(): any {
        return 1004;
    }
    getSchemaUncached(): any {
        return schema;
    }
    
    static migrate1003to1004(data: import("../savegame_typedefs.js").SavegameData): any {
        logger.log("Migrating 1003 to 1004");
        const dump: any = data.dump;
        if (!dump) {
            return true;
        }
        // The hub simply has an empty label
        const waypointData: any = dump.waypoints.waypoints;
        for (let i: any = 0; i < waypointData.length; ++i) {
            const waypoint: any = waypointData[i];
            if (!waypoint.deletable) {
                waypoint.label = null;
            }
            delete waypoint.deletable;
        }
    }
}
