import { createLogger } from "../../core/logging.js";
import { T } from "../../translations.js";
import { SavegameInterface_V1001 } from "./1001.js";
const schema: any = require("./1002.json");
const logger: any = createLogger("savegame_interface/1002");
export class SavegameInterface_V1002 extends SavegameInterface_V1001 {
    getVersion(): any {
        return 1002;
    }
    getSchemaUncached(): any {
        return schema;
    }
    
    static migrate1001to1002(data: import("../savegame_typedefs.js").SavegameData): any {
        logger.log("Migrating 1001 to 1002");
        const dump: any = data.dump;
        if (!dump) {
            return true;
        }
        const entities: any = dump.entities;
        for (let i: any = 0; i < entities.length; ++i) {
            const entity: any = entities[i];
            const beltComp: any = entity.components.Belt;
            const ejectorComp: any = entity.components.ItemEjector;
            if (beltComp && ejectorComp) {
                // @ts-ignore
                ejectorComp.instantEject = true;
            }
        }
    }
}
