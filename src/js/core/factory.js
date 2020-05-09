import { createLogger } from "./logging";

const logger = createLogger("factory");

// simple factory pattern
export class Factory {
    constructor(id) {
        this.id = id;

        // Store array as well as dictionary, to speed up lookups
        this.entries = [];
        this.entryIds = [];
        this.idToEntry = {};
    }

    getId() {
        return this.id;
    }

    register(entry) {
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
     * @param {string} id
     * @returns {boolean}
     */
    hasId(id) {
        return !!this.idToEntry[id];
    }

    /**
     * Finds an instance by a given id
     * @param {string} id
     * @returns {object}
     */
    findById(id) {
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
     * @returns {Array<object>}
     */
    getEntries() {
        return this.entries;
    }

    /**
     * Returns all registered ids
     * @returns {Array<string>}
     */
    getAllIds() {
        return this.entryIds;
    }

    /**
     * Returns amount of stored entries
     * @returns {number}
     */
    getNumEntries() {
        return this.entries.length;
    }
}
