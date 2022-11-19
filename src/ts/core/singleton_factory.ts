import { createLogger } from "./logging";

const logger = createLogger("singleton_factory");
// simple factory pattern
export class SingletonFactory<T extends { getId(): string }> {
    public entries: T[] = [];
    public idToEntry: {
        [id: string]: T;
    } = {};

    constructor(public id?: string) {}

    getId() {
        return this.id;
    }

    register(classHandle: Class<T>) {
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
            logger.error("Object with id", id, "is not registered!");
            assert(false, "Factory: Object with id '" + id + "' is not registered!");
            return null;
        }
        return entry;
    }

    /**
     * Finds an instance by its constructor (The class handle)
     */
    findByClass(classHandle: Class<T>): T {
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
     */
    getEntries(): Array<T> {
        return this.entries;
    }

    /**
     * Returns all registered ids
     */
    getAllIds(): Array<string> {
        return Object.keys(this.idToEntry);
    }

    /**
     * Returns amount of stored entries
     */
    getNumEntries(): number {
        return this.entries.length;
    }
}
