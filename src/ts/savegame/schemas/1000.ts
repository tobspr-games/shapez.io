import { BaseSavegameInterface } from "../savegame_interface.js";
const schema: any = require("./1000.json");
export class SavegameInterface_V1000 extends BaseSavegameInterface {
    getVersion(): any {
        return 1000;
    }
    getSchemaUncached(): any {
        return schema;
    }
}
