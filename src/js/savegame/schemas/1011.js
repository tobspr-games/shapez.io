import { createLogger } from "../../core/logging.js";
import { ItemProcessorComponent } from "../../game/components/item_processor.js";
import { MinerComponent } from "../../game/components/miner.js";
import { Entity } from "../../game/entity.js";
import { SavegameInterface_V1010 } from "./1010.js";

const schema = require("./1011.json");
const logger = createLogger("savegame_interface/1011");

export class SavegameInterface_V1011 extends SavegameInterface_V1010 {
    getVersion() {
        return 1011;
    }

    getSchemaUncached() {
        return schema;
    }

    /**
     * @param {import("../savegame_typedefs.js").SavegameData} data
     */
    static migrate1010to1011(data) {
        logger.log("Migrating 1010 to 1011");
        const dump = data.dump;
        if (!dump) {
            return true;
        }

        /** @type {Array<Entity} */
        const entities = dump.entities;

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const minerComp = entity.components.Miner;
            if (minerComp) {
                minerComp.progress = 0;
            }
            const processorComp = entity.components.ItemProcessor;
            if (processorComp) {
                processorComp.currentCharge = null;
            }
        }
    }
}
