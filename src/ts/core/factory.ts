import { createLogger } from "./logging";

const logger = createLogger("factory");

// simple factory pattern
export class Factory<T extends { getId: () => string }> {
    public entries: T[] = [];
    public entryIds: string[] = [];
    public idToEntry = {};

    constructor(public id?: string) {}

    getId() {
        return this.id;
    }

    register(entry: T) {
        // Extract id
        const id = entry.getId();
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
     */
    hasId(id: string): boolean {
        return !!this.idToEntry[id];
    }

    /**
     * Finds an instance by a given id
     */
    findById(id: string): T {
        const entry = this.idToEntry[id];
        if (!entry) {
            logger.error("Object with id", id, "is not registered on factory", this.id, "!");
            assert(false, "Factory: Object with id '" + id + "' is not registered!");
            return null;
        }
        return entry;
    }

    /**
     * Returns all entries
     */
    getEntries(): Array<T> {
        return this.entries;
    }

    /**
     * Returns all registered ids
     */
    getAllIds(): Array<string> {
        return this.entryIds;
    }

    /**
     * Returns amount of stored entries
     */
    getNumEntries(): number {
        return this.entries.length;
    }
}
