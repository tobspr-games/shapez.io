import { BasicSerializableObject } from "../savegame/serialization";

export class Component extends BasicSerializableObject {
    /**
     * Returns the components unique id
     * @returns {string}
     */
    static getId() {
        abstract;
        return "unknown-component";
    }

    /**
     * Should return the schema used for serialization
     */
    static getSchema() {
        return {};
    }

    /* dev:start */

    /**
     * Fixes typeof DerivedComponent is not assignable to typeof Component, compiled out
     * in non-dev builds
     */
    constructor(...args) {
        super();
    }

    /**
     * Returns a string representing the components data, only in dev builds
     * @returns {string}
     */
    getDebugString() {
        return null;
    }
    /* dev:end */
}
