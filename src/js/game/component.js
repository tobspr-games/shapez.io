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

    /**
     * Copy the current state to another component
     * @param {Component} otherComponent
     */
    copyAdditionalStateTo(otherComponent) {}

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

/**
 * TypeScript does not support Abstract Static methods (https://github.com/microsoft/TypeScript/issues/34516)
 * One workaround is to declare the type of the component and reference that for static methods
 * @typedef {typeof Component} StaticComponent
 */
