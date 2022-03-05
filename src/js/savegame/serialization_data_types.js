/* typehints:start */
import { GameRoot } from "../game/root";
import { BasicSerializableObject } from "./serialization";
/* typehints:end */

import { Vector } from "../core/vector";
import { round4Digits } from "../core/utils";
export const globalJsonSchemaDefs = {};

/**
 *
 * @param {import("./serialization").Schema} schema
 */
export function schemaToJsonSchema(schema) {
    const jsonSchema = {
        type: "object",
        additionalProperties: false,
        required: [],
        properties: {},
    };

    for (const key in schema) {
        const subSchema = schema[key].getAsJsonSchema();
        jsonSchema.required.push(key);
        jsonSchema.properties[key] = subSchema;
    }

    return jsonSchema;
}

/**
 * Helper function to create a json schema object
 * @param {any} properties
 */
function schemaObject(properties) {
    return {
        type: "object",
        required: Object.keys(properties).slice(),
        additionalProperties: false,
        properties,
    };
}

/**
 * Base serialization data type
 */
export class BaseDataType {
    /**
     * Serializes a given raw value
     * @param {any} value
     * @abstract
     */
    serialize(value) {
        abstract;
        return {};
    }

    /**
     * Verifies a given serialized value
     * @param {any} value
     * @returns {string|void} String error code or null on success
     */
    verifySerializedValue(value) {}

    /**
     * Deserializes a serialized value into the target object under the given key
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     * @abstract
     */
    deserialize(value, targetObject, targetKey, root) {
        abstract;
    }

    /**
     * Returns the json schema
     */
    getAsJsonSchema() {
        const key = this.getCacheKey();
        const schema = this.getAsJsonSchemaUncached();

        if (!globalJsonSchemaDefs[key]) {
            // schema.$id = key;
            globalJsonSchemaDefs[key] = schema;
        }

        return {
            $ref: "#/definitions/" + key,
        };
    }

    /**
     * INTERNAL Should return the json schema representation
     * @abstract
     */
    getAsJsonSchemaUncached() {
        abstract;
    }

    /**
     * Returns whether null values are okay
     * @returns {boolean}
     */
    allowNull() {
        return false;
    }

    // Helper methods

    /**
     * Deserializes a serialized value, but performs integrity checks before
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserializeWithVerify(value, targetObject, targetKey, root) {
        const errorCode = this.verifySerializedValue(value);
        if (errorCode) {
            return (
                "serialization verify failed: " +
                errorCode +
                " [value " +
                (JSON.stringify(value) || "").substr(0, 100) +
                "]"
            );
        }
        return this.deserialize(value, targetObject, targetKey, root);
    }

    /**
     * Should return a cacheable key
     * @abstract
     */
    getCacheKey() {
        abstract;
        return "";
    }
}

export class TypeInteger extends BaseDataType {
    serialize(value) {
        assert(Number.isInteger(value), "Type integer got non integer for serialize: " + value);
        return value;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = value;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "integer",
        };
    }

    verifySerializedValue(value) {
        if (!Number.isInteger(value)) {
            return "Not a valid number";
        }
    }

    getCacheKey() {
        return "int";
    }
}

export class TypePositiveInteger extends BaseDataType {
    serialize(value) {
        assert(Number.isInteger(value), "Type integer got non integer for serialize: " + value);
        assert(value >= 0, "value < 0: " + value);
        return value;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = value;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "integer",
            minimum: 0,
        };
    }

    verifySerializedValue(value) {
        if (!Number.isInteger(value)) {
            return "Not a valid number";
        }
        if (value < 0) {
            return "Negative value for positive integer";
        }
    }

    getCacheKey() {
        return "uint";
    }
}

export class TypePositiveIntegerOrString extends BaseDataType {
    serialize(value) {
        if (Number.isInteger(value)) {
            assert(value >= 0, "type integer got negative value: " + value);
        } else if (typeof value === "string") {
            // all good
        } else {
            assertAlways(false, "Type integer|string got non integer or string for serialize: " + value);
        }
        return value;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = value;
    }

    getAsJsonSchemaUncached() {
        return {
            oneOf: [{ type: "integer", minimum: 0 }, { type: "string" }],
        };
    }

    verifySerializedValue(value) {
        if (Number.isInteger(value)) {
            if (value < 0) {
                return "Negative value for positive integer";
            }
        } else if (typeof value === "string") {
            // all good
        } else {
            return "Not a valid number or string: " + value;
        }
    }

    getCacheKey() {
        return "uint_str";
    }
}

export class TypeBoolean extends BaseDataType {
    serialize(value) {
        assert(value === true || value === false, "Type bool got non bool for serialize: " + value);
        return value;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = value;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "boolean",
        };
    }

    verifySerializedValue(value) {
        if (value !== true && value !== false) {
            return "Not a boolean";
        }
    }

    getCacheKey() {
        return "bool";
    }
}

export class TypeString extends BaseDataType {
    serialize(value) {
        assert(typeof value === "string", "Type string got non string for serialize: " + value);
        return value;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = value;
    }
    getAsJsonSchemaUncached() {
        return {
            type: "string",
        };
    }

    verifySerializedValue(value) {
        if (typeof value !== "string") {
            return "Not a valid string";
        }
    }

    getCacheKey() {
        return "string";
    }
}

export class TypeVector extends BaseDataType {
    serialize(value) {
        assert(value instanceof Vector, "Type vector got non vector for serialize: " + value);
        return {
            x: round4Digits(value.x),
            y: round4Digits(value.y),
        };
    }

    getAsJsonSchemaUncached() {
        return schemaObject({
            x: {
                type: "number",
            },
            y: {
                type: "number",
            },
        });
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = new Vector(value.x, value.y);
    }

    verifySerializedValue(value) {
        if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) {
            return "Not a valid vector, missing x/y or bad data type";
        }
    }

    getCacheKey() {
        return "vector";
    }
}

export class TypeTileVector extends BaseDataType {
    serialize(value) {
        assert(value instanceof Vector, "Type vector got non vector for serialize: " + value);
        assert(Number.isInteger(value.x) && value.x > 0, "Invalid tile x:" + value.x);
        assert(Number.isInteger(value.y) && value.y > 0, "Invalid tile x:" + value.y);
        return { x: value.x, y: value.y };
    }

    getAsJsonSchemaUncached() {
        return schemaObject({
            x: {
                type: "integer",
                minimum: 0,
                maximum: 256,
            },
            y: {
                type: "integer",
                minimum: 0,
                maximum: 256,
            },
        });
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = new Vector(value.x, value.y);
    }

    verifySerializedValue(value) {
        if (!Number.isInteger(value.x) || !Number.isInteger(value.y)) {
            return "Not a valid tile vector, missing x/y or bad data type";
        }
        if (value.x < 0 || value.y < 0) {
            return "Invalid tile vector, x or y < 0";
        }
    }

    getCacheKey() {
        return "tilevector";
    }
}

export class TypeNumber extends BaseDataType {
    serialize(value) {
        assert(Number.isFinite(value), "Type number got non number for serialize: " + value);
        assert(!Number.isNaN(value), "Value is nan: " + value);
        return round4Digits(value);
    }

    getAsJsonSchemaUncached() {
        return {
            type: "number",
        };
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = value;
    }

    verifySerializedValue(value) {
        if (!Number.isFinite(value)) {
            return "Not a valid number: " + value;
        }
    }

    getCacheKey() {
        return "float";
    }
}

export class TypePositiveNumber extends BaseDataType {
    serialize(value) {
        assert(Number.isFinite(value), "Type number got non number for serialize: " + value);
        assert(value >= 0, "Postitive number got negative value: " + value);
        return round4Digits(value);
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = value;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "number",
            minimum: 0,
        };
    }

    verifySerializedValue(value) {
        if (!Number.isFinite(value)) {
            return "Not a valid number: " + value;
        }
        if (value < 0) {
            return "Positive number got negative value: " + value;
        }
    }

    getCacheKey() {
        return "ufloat";
    }
}

export class TypeEnum extends BaseDataType {
    /**
     * @param {Object.<string, any>} enumeration
     */
    constructor(enumeration = {}) {
        super();
        this.availableValues = Object.values(enumeration);
    }

    serialize(value) {
        assert(this.availableValues.indexOf(value) >= 0, "Unknown value: " + value);
        return value;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = value;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "string",
            enum: this.availableValues,
        };
    }

    verifySerializedValue(value) {
        if (this.availableValues.indexOf(value) < 0) {
            return "Unknown enum value: " + value;
        }
    }

    getCacheKey() {
        return "enum." + this.availableValues.join(",");
    }
}

export class TypeEntity extends BaseDataType {
    serialize(value) {
        // assert(value instanceof Entity, "Not a valid entity ref: " + value);
        assert(value.uid, "Entity has no uid yet");
        assert(!value.destroyed, "Entity already destroyed");
        assert(!value.queuedForDestroy, "Entity queued for destroy");

        return value.uid;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "integer",
            minimum: 0,
        };
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        const entity = root.entityMgr.findByUid(value);
        if (!entity) {
            return "Entity not found by uid: " + value;
        }
        targetObject[targetKey] = entity;
    }

    verifySerializedValue(value) {
        if (!Number.isFinite(value)) {
            return "Not a valid uuid: " + value;
        }
    }

    getCacheKey() {
        return "entity";
    }
}

export class TypeEntityWeakref extends BaseDataType {
    serialize(value) {
        if (value === null) {
            return null;
        }

        // assert(value instanceof Entity, "Not a valid entity ref (weak): " + value);
        assert(value.uid, "Entity has no uid yet");
        if (value.destroyed || value.queuedForDestroy) {
            return null;
        }
        return value.uid;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        if (value === null) {
            targetObject[targetKey] = null;
            return;
        }
        const entity = root.entityMgr.findByUid(value, false);
        targetObject[targetKey] = entity;
    }

    getAsJsonSchemaUncached() {
        return {
            type: ["null", "integer"],
            minimum: 0,
        };
    }

    allowNull() {
        return true;
    }

    verifySerializedValue(value) {
        if (value !== null && !Number.isFinite(value)) {
            return "Not a valid uuid: " + value;
        }
    }

    getCacheKey() {
        return "entity-weakref";
    }
}

export class TypeClass extends BaseDataType {
    /**
     *
     * @param {FactoryTemplate<*>} registry
     * @param {(GameRoot, object) => object} customResolver
     */
    constructor(registry, customResolver = null) {
        super();
        this.registry = registry;
        this.customResolver = customResolver;
    }

    serialize(value) {
        assert(typeof value === "object", "Not a class instance: " + value);
        return {
            $: value.constructor.getId(),
            data: value.serialize(),
        };
    }

    getAsJsonSchemaUncached() {
        const options = [];
        const entries = this.registry.getEntries();
        for (let i = 0; i < entries.length; ++i) {
            const entry = entries[i];

            options.push(
                schemaObject({
                    $: {
                        type: "string",
                        // @ts-ignore
                        enum: [entry.getId()],
                    },
                    // @ts-ignore
                    data: schemaToJsonSchema(entry.getCachedSchema()),
                })
            );
        }

        return { oneOf: options };
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        let instance;

        if (this.customResolver) {
            instance = this.customResolver(root, value);
            if (!instance) {
                return "Failed to call custom resolver";
            }
        } else {
            const instanceClass = this.registry.findById(value.$);
            if (!instanceClass || !instanceClass.prototype) {
                return "Invalid class id (runtime-err): " + value.$ + "->" + instanceClass;
            }
            instance = Object.create(instanceClass.prototype);
            const errorState = instance.deserialize(value.data);
            if (errorState) {
                return errorState;
            }
        }
        targetObject[targetKey] = instance;
    }

    verifySerializedValue(value) {
        if (!value) {
            return "Got null data";
        }

        if (!this.registry.hasId(value.$)) {
            return "Invalid class id: " + value.$ + " (factory is " + this.registry.getId() + ")";
        }
    }

    getCacheKey() {
        return "class." + this.registry.getId();
    }
}

export class TypeClassData extends BaseDataType {
    /**
     *
     * @param {FactoryTemplate<*>} registry
     */
    constructor(registry) {
        super();
        this.registry = registry;
    }

    serialize(value) {
        assert(typeof value === "object", "Not a class instance: " + value);
        return value.serialize();
    }

    getAsJsonSchemaUncached() {
        const options = [];
        const entries = this.registry.getEntries();
        for (let i = 0; i < entries.length; ++i) {
            const entry = entries[i];
            options.push(
                schemaToJsonSchema(/** @type {typeof BasicSerializableObject} */ (entry).getCachedSchema())
            );
        }
        return { oneOf: options };
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        assert(false, "can not deserialize class data of type " + this.registry.getId());
    }

    verifySerializedValue(value) {
        if (!value) {
            return "Got null data";
        }
    }

    getCacheKey() {
        return "class." + this.registry.getId();
    }
}

export class TypeClassFromMetaclass extends BaseDataType {
    /**
     *
     * @param {typeof BasicSerializableObject} classHandle
     * @param {SingletonFactoryTemplate<*>} registry
     */
    constructor(classHandle, registry) {
        super();
        this.registry = registry;
        this.classHandle = classHandle;
    }

    serialize(value) {
        assert(typeof value === "object", "Not a class instance: " + value);
        return {
            $: value.getMetaclass().getId(),
            data: value.serialize(),
        };
    }

    getAsJsonSchemaUncached() {
        // const options = [];
        const ids = this.registry.getAllIds();

        return {
            $: {
                type: "string",
                enum: ids,
            },
            data: schemaToJsonSchema(this.classHandle.getCachedSchema()),
        };
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        const metaClassInstance = this.registry.findById(value.$);
        if (!metaClassInstance || !metaClassInstance.prototype) {
            return "Invalid meta class id (runtime-err): " + value.$ + "->" + metaClassInstance;
        }

        const instanceClass = metaClassInstance.getInstanceClass();
        const instance = Object.create(instanceClass.prototype);
        const errorState = instance.deserialize(value.data);
        if (errorState) {
            return errorState;
        }
        targetObject[targetKey] = instance;
    }

    verifySerializedValue(value) {
        if (!value) {
            return "Got null data";
        }

        if (!this.registry.hasId(value.$)) {
            return "Invalid class id: " + value.$ + " (factory is " + this.registry.getId() + ")";
        }
    }

    getCacheKey() {
        return "classofmetaclass." + this.registry.getId();
    }
}

export class TypeMetaClass extends BaseDataType {
    /**
     *
     * @param {SingletonFactoryTemplate<*>} registry
     */
    constructor(registry) {
        super();
        this.registry = registry;
    }

    serialize(value) {
        return value.getId();
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        const instanceClass = this.registry.findById(value);
        if (!instanceClass) {
            return "Invalid class id (runtime-err): " + value;
        }
        targetObject[targetKey] = instanceClass;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "string",
            enum: this.registry.getAllIds(),
        };
    }

    verifySerializedValue(value) {
        if (!value) {
            return "Got null data";
        }

        if (typeof value !== "string") {
            return "Got non string data";
        }

        if (!this.registry.hasId(value)) {
            return "Invalid class id: " + value + " (factory is " + this.registry.getId() + ")";
        }
    }

    getCacheKey() {
        return "metaclass." + this.registry.getId();
    }
}

export class TypeArray extends BaseDataType {
    /**
     * @param {BaseDataType} innerType
     */
    constructor(innerType, fixedSize = false) {
        super();
        this.fixedSize = fixedSize;
        this.innerType = innerType;
    }

    serialize(value) {
        assert(Array.isArray(value), "Not an array");
        const result = new Array(value.length);
        for (let i = 0; i < value.length; ++i) {
            result[i] = this.innerType.serialize(value[i]);
        }
        return result;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        let destination = targetObject[targetKey];
        if (!destination) {
            targetObject[targetKey] = destination = new Array(value.length);
        }

        const size = this.fixedSize ? Math.min(value.length, destination.length) : value.length;

        for (let i = 0; i < size; ++i) {
            const errorStatus = this.innerType.deserializeWithVerify(value[i], destination, i, root);
            if (errorStatus) {
                return errorStatus;
            }
        }
    }

    getAsJsonSchemaUncached() {
        return {
            type: "array",
            items: this.innerType.getAsJsonSchema(),
        };
    }

    verifySerializedValue(value) {
        if (!Array.isArray(value)) {
            return "Not an array: " + value;
        }
    }

    getCacheKey() {
        return "array." + this.innerType.getCacheKey();
    }
}

export class TypeFixedClass extends BaseDataType {
    /**
     *
     * @param {typeof BasicSerializableObject} baseclass
     */
    constructor(baseclass) {
        super();
        this.baseclass = baseclass;
    }

    serialize(value) {
        assert(value instanceof this.baseclass, "Not a valid class instance");
        return value.serialize();
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        const instance = Object.create(this.baseclass.prototype);
        const errorState = instance.deserialize(value);
        if (errorState) {
            return "Failed to deserialize class: " + errorState;
        }
        targetObject[targetKey] = instance;
    }

    getAsJsonSchemaUncached() {
        this.baseclass.getSchema();
        this.baseclass.getCachedSchema();
        return schemaToJsonSchema(this.baseclass.getCachedSchema());
    }

    verifySerializedValue(value) {
        if (!value) {
            return "Got null data";
        }
    }

    getCacheKey() {
        return "fixedclass." + this.baseclass.getId();
    }
}

export class TypeKeyValueMap extends BaseDataType {
    /**
     * @param {BaseDataType} valueType
     * @param {boolean=} includeEmptyValues
     */
    constructor(valueType, includeEmptyValues = true) {
        super();
        this.valueType = valueType;
        this.includeEmptyValues = includeEmptyValues;
    }

    serialize(value) {
        assert(typeof value === "object", "not an object");
        let result = {};
        for (const key in value) {
            const serialized = this.valueType.serialize(value[key]);
            if (!this.includeEmptyValues && typeof serialized === "object") {
                if (
                    serialized.$ &&
                    typeof serialized.data === "object" &&
                    Object.keys(serialized.data).length === 0
                ) {
                    continue;
                } else if (Object.keys(serialized).length === 0) {
                    continue;
                }
            }

            result[key] = serialized;
        }
        return result;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        let result = {};
        for (const key in value) {
            const errorCode = this.valueType.deserializeWithVerify(value[key], result, key, root);
            if (errorCode) {
                return errorCode;
            }
        }
        targetObject[targetKey] = result;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "object",
            additionalProperties: this.valueType.getAsJsonSchema(),
        };
    }

    verifySerializedValue(value) {
        if (typeof value !== "object") {
            return "KV map is not an object";
        }
    }

    getCacheKey() {
        return "kvmap." + this.valueType.getCacheKey();
    }
}

export class TypeClassId extends BaseDataType {
    /**
     * @param {FactoryTemplate<*>|SingletonFactoryTemplate<*>} registry
     */
    constructor(registry) {
        super();
        this.registry = registry;
    }

    serialize(value) {
        assert(typeof value === "string", "Not a valid string");
        assert(this.registry.hasId(value), "Id " + value + " not found in registry");
        return value;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        targetObject[targetKey] = value;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "string",
            enum: this.registry.getAllIds(),
        };
    }

    verifySerializedValue(value) {
        if (typeof value !== "string") {
            return "Not a valid registry id key: " + value;
        }
        if (!this.registry.hasId(value)) {
            return "Id " + value + " not known to registry";
        }
    }

    getCacheKey() {
        return "classid." + this.registry.getId();
    }
}

export class TypePair extends BaseDataType {
    /**
     * @param {BaseDataType} type1
     * @param {BaseDataType} type2
     */
    constructor(type1, type2) {
        super();
        assert(type1 && type1 instanceof BaseDataType, "bad first type given for pair");
        assert(type2 && type2 instanceof BaseDataType, "bad second type given for pair");
        this.type1 = type1;
        this.type2 = type2;
    }

    serialize(value) {
        assert(Array.isArray(value), "pair: not an array");
        assert(value.length === 2, "pair: length != 2");
        return [this.type1.serialize(value[0]), this.type2.serialize(value[1])];
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        const result = [undefined, undefined];

        let errorCode = this.type1.deserialize(value[0], result, 0, root);
        if (errorCode) {
            return errorCode;
        }
        errorCode = this.type2.deserialize(value[1], result, 1, root);
        if (errorCode) {
            return errorCode;
        }

        targetObject[targetKey] = result;
    }

    getAsJsonSchemaUncached() {
        return {
            type: "array",
            minLength: 2,
            maxLength: 2,
            items: [this.type1.getAsJsonSchema(), this.type2.getAsJsonSchema()],
        };
    }

    verifySerializedValue(value) {
        if (!Array.isArray(value)) {
            return "Pair is not an array";
        }
        if (value.length !== 2) {
            return "Pair length != 2";
        }
        let errorCode = this.type1.verifySerializedValue(value[0]);
        if (errorCode) {
            return errorCode;
        }
        errorCode = this.type2.verifySerializedValue(value[1]);
        if (errorCode) {
            return errorCode;
        }
    }

    getCacheKey() {
        return "pair.(" + this.type1.getCacheKey() + "," + this.type2.getCacheKey + ")";
    }
}

export class TypeNullable extends BaseDataType {
    /**
     * @param {BaseDataType} wrapped
     */
    constructor(wrapped) {
        super();
        this.wrapped = wrapped;
    }

    serialize(value) {
        if (value === null || value === undefined) {
            return null;
        }
        return this.wrapped.serialize(value);
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        if (value === null || value === undefined) {
            targetObject[targetKey] = null;
            return;
        }
        return this.wrapped.deserialize(value, targetObject, targetKey, root);
    }

    verifySerializedValue(value) {
        if (value === null) {
            return;
        }
        return this.wrapped.verifySerializedValue(value);
    }

    getAsJsonSchemaUncached() {
        return {
            oneOf: [
                {
                    type: "null",
                },
                this.wrapped.getAsJsonSchema(),
            ],
        };
    }

    allowNull() {
        return true;
    }

    getCacheKey() {
        return "nullable." + this.wrapped.getCacheKey();
    }
}

export class TypeStructuredObject extends BaseDataType {
    /**
     * @param {Object.<string, BaseDataType>} descriptor
     */
    constructor(descriptor) {
        super();
        this.descriptor = descriptor;
    }

    serialize(value) {
        assert(typeof value === "object", "not an object");
        let result = {};
        for (const key in this.descriptor) {
            // assert(value.hasOwnProperty(key), "Serialization: Object does not have", key, "property!");
            result[key] = this.descriptor[key].serialize(value[key]);
        }
        return result;
    }

    /**
     * @see BaseDataType.deserialize
     * @param {any} value
     * @param {GameRoot} root
     * @param {object} targetObject
     * @param {string|number} targetKey
     * @returns {string|void} String error code or null on success
     */
    deserialize(value, targetObject, targetKey, root) {
        let target = targetObject[targetKey];
        if (!target) {
            targetObject[targetKey] = target = {};
        }

        for (const key in value) {
            const valueType = this.descriptor[key];
            const errorCode = valueType.deserializeWithVerify(value[key], target, key, root);
            if (errorCode) {
                return errorCode;
            }
        }
    }

    getAsJsonSchemaUncached() {
        let properties = {};
        for (const key in this.descriptor) {
            properties[key] = this.descriptor[key].getAsJsonSchema();
        }

        return {
            type: "object",
            required: Object.keys(this.descriptor),
            properties,
        };
    }

    verifySerializedValue(value) {
        if (typeof value !== "object") {
            return "structured object is not an object";
        }
        for (const key in this.descriptor) {
            if (!value.hasOwnProperty(key)) {
                return "structured object is missing key " + key;
            }
            const subError = this.descriptor[key].verifySerializedValue(value[key]);
            if (subError) {
                return "structured object::" + subError;
            }
        }
    }

    getCacheKey() {
        let props = [];
        for (const key in this.descriptor) {
            props.push(key + "=" + this.descriptor[key].getCacheKey());
        }
        return "structured[" + props.join(",") + "]";
    }
}
