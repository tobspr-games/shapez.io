import { createLogger } from "../core/logging";
const Ajv: any = require("ajv");
const ajv: any = new Ajv({
    allErrors: false,
    uniqueItems: false,
    unicode: false,
    nullable: false,
});
const validators: any = {};
const logger: any = createLogger("savegame_interface");
export class BaseSavegameInterface {
    /**
     * Returns the interfaces version
     */
    getVersion(): any {
        throw new Error("Implement get version");
    }
    /**
     * Returns the uncached json schema
     * {}
     */
    getSchemaUncached(): object {
        throw new Error("Implement get schema");
    }
    getValidator(): any {
        const version: any = this.getVersion();
        if (validators[version]) {
            return validators[version];
        }
        logger.log("Compiling schema for savegame version", version);
        const schema: any = this.getSchemaUncached();
        try {
            validators[version] = ajv.compile(schema);
        }
        catch (ex: any) {
            logger.error("SCHEMA FOR", this.getVersion(), "IS INVALID!");
            logger.error(ex);
            throw new Error("Invalid schema for version " + version);
        }
        return validators[version];
    }
    public data = data;
    /**
     * Constructs an new interface for the given savegame
     */

    constructor(data) {
    }
    /**
     * Validates the data
     * {}
     */
    validate(): boolean {
        const validator: any = this.getValidator();
        if (!validator(this.data)) {
            logger.error("Savegame failed validation! ErrorText:", ajv.errorsText(validator.errors), "RawErrors:", validator.errors);
            return false;
        }
        return true;
    }
    ///// INTERFACE (Override when the schema changes) /////
    /**
     * Returns the time of last update
     * {}
     */
    readLastUpdate(): number {
        return this.data.lastUpdate;
    }
    /**
     * Returns the ingame time in seconds
     * {}
     */
    readIngameTimeSeconds(): number {
        return this.data.dump.time.timeSeconds;
    }
}
