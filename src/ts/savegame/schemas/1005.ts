import { createLogger } from "../../core/logging.js";
import { SavegameInterface_V1004 } from "./1004.js";
const schema: any = require("./1005.json");
const logger: any = createLogger("savegame_interface/1005");
export class SavegameInterface_V1005 extends SavegameInterface_V1004 {
    getVersion(): any {
        return 1005;
    }
    getSchemaUncached(): any {
        return schema;
    }
    
    static migrate1004to1005(data: import("../savegame_typedefs.js").SavegameData): any {
        logger.log("Migrating 1004 to 1005");
        const dump: any = data.dump;
        if (!dump) {
            return true;
        }
        // just reset belt paths for now
        dump.beltPaths = [];
        const entities: any = dump.entities;
        // clear ejector slots
        for (let i: any = 0; i < entities.length; ++i) {
            const entity: any = entities[i];
            const itemEjector: any = entity.components.ItemEjector;
            if (itemEjector) {
                const slots: any = itemEjector.slots;
                for (let k: any = 0; k < slots.length; ++k) {
                    const slot: any = slots[k];
                    slot.item = null;
                    slot.progress = 0;
                }
            }
        }
    }
}
