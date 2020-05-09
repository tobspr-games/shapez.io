import { BaseSavegameInterface } from "../savegame_interface.js";

const schema = require("./1000.json");

export class SavegameInterface_V1000 extends BaseSavegameInterface {
    getVersion() {
        return 1000;
    }

    getSchemaUncached() {
        return schema;
    }
}
