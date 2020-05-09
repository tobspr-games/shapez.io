// simple factory pattern
export class SingletonFactory {
    constructor() {
        // Store array as well as dictionary, to speed up lookups
        this.entries = [];
        this.idToEntry = {};
    }

    register(classHandle) {
        // First, construct instance
        const instance = new classHandle();

        // Extract id
        const id = instance.getId();
        assert(id, "Factory: Invalid id for class " + classHandle.name + ": " + id);

        // Check duplicates
        assert(!this.idToEntry[id], "Duplicate factory entry for " + id);

        // Insert
        this.entries.push(instance);
        this.idToEntry[id] = instance;
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
            assert(false, "Factory: Object with id '" + id + "' is not registered!");
            return null;
        }
        return entry;
    }

    /**
     * Finds an instance by its constructor (The class handle)
     * @param {object} classHandle
     * @returns {object}
     */
    findByClass(classHandle) {
        for (let i = 0; i < this.entries.length; ++i) {
            if (this.entries[i] instanceof classHandle) {
                return this.entries[i];
            }
        }
        assert(false, "Factory: Object not found by classHandle (classid: " + classHandle.name + ")");
        return null;
    }

    /**
     * Returns all entries
     * @returns {Array<object>}
     */
    getEntries() {
        return this.entries;
    }

    /**
     * Returns amount of stored entries
     * @returns {number}
     */
    getNumEntries() {
        return this.entries.length;
    }
}
