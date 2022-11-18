import { createLogger } from "./logging";
const logger: any = createLogger("factory");
// simple factory pattern
export class Factory {
    public id = id;
    public entries = [];
    public entryIds = [];
    public idToEntry = {};

    constructor(id) {
    }
    getId(): any {
        return this.id;
    }
    register(entry: any): any {
        // Extract id
        const id: any = entry.getId();
        assert(id, "Factory: Invalid id for class: " + entry);
        // Check duplicates
        assert(!this.idToEntry[id], "Duplicate factory entry for " + id);
        // Insert
        this.entries.push(entry);
        this.entryIds.push(id);
        this.idToEntry[id] = entry;
    }
    /**
     * Checks if a given id is registered
     * {}
     */
    hasId(id: string): boolean {
        return !!this.idToEntry[id];
    }
    /**
     * Finds an instance by a given id
     * {}
     */
    findById(id: string): object {
        const entry: any = this.idToEntry[id];
        if (!entry) {
            logger.error("Object with id", id, "is not registered on factory", this.id, "!");
            assert(false, "Factory: Object with id '" + id + "' is not registered!");
            return null;
        }
        return entry;
    }
    /**
     * Returns all entries
     * {}
     */
    getEntries(): Array<object> {
        return this.entries;
    }
    /**
     * Returns all registered ids
     * {}
     */
    getAllIds(): Array<string> {
        return this.entryIds;
    }
    /**
     * Returns amount of stored entries
     * {}
     */
    getNumEntries(): number {
        return this.entries.length;
    }
}
