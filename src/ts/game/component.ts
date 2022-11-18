import { BasicSerializableObject } from "../savegame/serialization";
export class Component extends BasicSerializableObject {
    /**
     * Returns the components unique id
     * {}
     * @abstract
     */
    static getId(): string {
        abstract;
        return "unknown-component";
    }
    /**
     * Should return the schema used for serialization
     */
    static getSchema() {
        return {};
    }
    /**
     * Copy the current state to another component
     */
    copyAdditionalStateTo(otherComponent: Component) { }
    /**
     * Clears all items and state
     */
    clear() { }
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
     * {}
     */
    getDebugString(): string {
        return null;
    }
}

