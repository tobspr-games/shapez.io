import { createLogger } from "../core/logging";
import { BaseDataType, TypeArray, TypeBoolean, TypeClass, TypeClassData, TypeClassFromMetaclass, TypeClassId, TypeEntity, TypeEntityWeakref, TypeEnum, TypeFixedClass, TypeInteger, TypeKeyValueMap, TypeMetaClass, TypeNullable, TypeNumber, TypePair, TypePositiveInteger, TypePositiveNumber, TypeString, TypeStructuredObject, TypeVector, TypePositiveIntegerOrString, } from "./serialization_data_types";
const logger = createLogger("serialization");
// Schema declarations
export const types = {
    int: new TypeInteger(),
    uint: new TypePositiveInteger(),
    float: new TypeNumber(),
    ufloat: new TypePositiveNumber(),
    string: new TypeString(),
    entity: new TypeEntity(),
    weakEntityRef: new TypeEntityWeakref(),
    vector: new TypeVector(),
    tileVector: new TypeVector(),
    bool: new TypeBoolean(),
    uintOrString: new TypePositiveIntegerOrString(),
        nullable(wrapped: BaseDataType) {
        return new TypeNullable(wrapped);
    },
        classId(registry: FactoryTemplate<*> | SingletonFactoryTemplate<*>) {
        return new TypeClassId(registry);
    },
        keyValueMap(valueType: BaseDataType, includeEmptyValues: boolean= = true) {
        return new TypeKeyValueMap(valueType, includeEmptyValues);
    },
        enum(values: {
        [idx: string]: any;
    }) {
        return new TypeEnum(values);
    },
        obj(registry: FactoryTemplate<*>, resolver: (GameRoot, any) => object= = null) {
        return new TypeClass(registry, resolver);
    },
        objData(registry: FactoryTemplate<*>) {
        return new TypeClassData(registry);
    },
        knownType(cls: typeof BasicSerializableObject) {
        return new TypeFixedClass(cls);
    },
        array(innerType: BaseDataType) {
        return new TypeArray(innerType);
    },
        fixedSizeArray(innerType: BaseDataType) {
        return new TypeArray(innerType, true);
    },
        classRef(registry) {
        return new TypeMetaClass(registry);
    },
        structured(descriptor: {
        [idx: string]: BaseDataType;
    }) {
        return new TypeStructuredObject(descriptor);
    },
        pair(a: BaseDataType, b: BaseDataType) {
        return new TypePair(a, b);
    },
        classWithMetaclass(classHandle: typeof BasicSerializableObject, registry: SingletonFactoryTemplate<*>) {
        return new TypeClassFromMetaclass(classHandle, registry);
    },
};
export type Schema = Object<string, BaseDataType> | object;

const globalSchemaCache = {};
/* dev:start */
const classnamesCache = {};
/* dev:end*/
export class BasicSerializableObject {
    /* dev:start */
    /**
     * Fixes typeof DerivedComponent is not assignable to typeof Component, compiled out
     * in non-dev builds
     */

    constructor(...args) { }
    /* dev:end */
    static getId() {
        abstract;
    }
    /**
     * Should return the serialization schema
     * {}
     */
    static getSchema(): Schema {
        return {};
    }
    // Implementation
    /** {} */
    static getCachedSchema(): Schema {
        const id = this.getId();
        /* dev:start */
        assert(classnamesCache[id] === this || classnamesCache[id] === undefined, "Class name taken twice: " + id + " (from " + this.name + ")");
        classnamesCache[id] = this;
        /* dev:end */
        const entry = globalSchemaCache[id];
        if (entry) {
            return entry;
        }
        const schema = this.getSchema();
        globalSchemaCache[id] = schema;
        return schema;
    }
    /** {} */
    serialize(): object | string | number {
        return serializeSchema(this, 

        this.constructor as typeof BasicSerializableObject).getCachedSchema());
    }
    /**
     * {}
     */
    deserialize(data: any, root: import("./savegame_serializer").GameRoot = null): string | void {
        return deserializeSchema(this, 

        this.constructor as typeof BasicSerializableObject).getCachedSchema(), data, null, root);
    }
    /** {} */
    static verify(data): string | void {
        return verifySchema(this.getCachedSchema(), data);
    }
}
/**
 * Serializes an object using the given schema, mergin with the given properties
 * {} Serialized data object
 */
export function serializeSchema(obj: object, schema: Schema, mergeWith: object= = {}): object {
    for (const key in schema) {
        if (!obj.hasOwnProperty(key)) {
            logger.error("Invalid schema, property", key, "does not exist on", obj, "(schema=", schema, ")");
            assert(obj.hasOwnProperty(key), "serialization: invalid schema, property does not exist on object: " + key);
        }
        if (!schema[key]) {
            assert(false, "Invalid schema (bad key '" + key + "'): " + JSON.stringify(schema));
        }
        if (G_IS_DEV) {
            try {
                mergeWith[key] = schema[key].serialize(obj[key]);
            }
            catch (ex) {
                logger.error("Serialization of", obj, "failed on key '" + key + "' ->", ex, "(schema was", schema, ")");
                throw ex;
            }
        }
        else {
            mergeWith[key] = schema[key].serialize(obj[key]);
        }
    }
    return mergeWith;
}
/**
 * Deserializes data into an object
 * {} String error code or nothing on success
 */
export function deserializeSchema(obj: object, schema: Schema, data: object, baseclassErrorResult: string | void | null= = null, root: import("../game/root").GameRoot=): string | void {
    if (baseclassErrorResult) {
        return baseclassErrorResult;
    }
    if (data === null || typeof data === "undefined") {
        logger.error("Got 'NULL' data for", obj, "and schema", schema, "!");
        return "Got null data";
    }
    for (const key in schema) {
        if (!data.hasOwnProperty(key)) {
            logger.error("Data", data, "does not contain", key, "(schema:", schema, ")");

            return "Missing key in schema: " + key + " of class " + obj.constructor.name;
        }
        if (!schema[key].allowNull() && (data[key] === null || data[key] === undefined)) {
            logger.error("Data", data, "has null value for", key, "(schema:", schema, ")");

            return "Non-nullable entry is null: " + key + " of class " + obj.constructor.name;
        }
        const errorStatus = schema[key].deserializeWithVerify(data[key], obj, key, obj.root || root);
        if (errorStatus) {
            logger.error("Deserialization failed with error '" + errorStatus + "' on object", obj, "and key", key, "(root? =", obj.root ? "y" : "n", ")");
            return errorStatus;
        }
    }
}
/**
 * Verifies stored data using the given schema
 * {} String error code or nothing on success
 */
export function verifySchema(schema: Schema, data: object): string | void {
    for (const key in schema) {
        if (!data.hasOwnProperty(key)) {
            logger.error("Data", data, "does not contain", key, "(schema:", schema, ")");
            return "verify: missing key required by schema in stored data: " + key;
        }
        if (!schema[key].allowNull() && (data[key] === null || data[key] === undefined)) {
            logger.error("Data", data, "has null value for", key, "(schema:", schema, ")");
            return "verify: non-nullable entry is null: " + key;
        }
        const errorStatus = schema[key].verifySerializedValue(data[key]);
        if (errorStatus) {
            logger.error(errorStatus);
            return "verify: " + errorStatus;
        }
    }
}
/**
 * Extends a schema by adding the properties from the new schema to the existing base schema
 * {}
 */
export function extendSchema(base: Schema, newOne: Schema): Schema {
        const result: Schema = Object.assign({}, base);
    for (const key in newOne) {
        if (result.hasOwnProperty(key)) {
            logger.error("Extend schema got duplicate key:", key);
            continue;
        }
        result[key] = newOne[key];
    }
    return result;
}
