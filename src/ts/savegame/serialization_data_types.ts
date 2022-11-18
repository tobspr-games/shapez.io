/* typehints:start */
import type { GameRoot } from "../game/root";
import type { BasicSerializableObject } from "./serialization";
/* typehints:end */
import { Vector } from "../core/vector";
import { round4Digits } from "../core/utils";
export const globalJsonSchemaDefs: any = {};
export function schemaToJsonSchema(schema: import("./serialization").Schema): any {
    const jsonSchema: any = {
        type: "object",
        additionalProperties: false,
        required: [],
        properties: {},
    };
    for (const key: any in schema) {
        const subSchema: any = schema[key].getAsJsonSchema();
        jsonSchema.required.push(key);
        jsonSchema.properties[key] = subSchema;
    }
    return jsonSchema;
}
/**
 * Helper function to create a json schema object
 */
function schemaObject(properties: any): any {
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
     * @abstract
     */
    serialize(value: any): any {
        abstract;
        return {};
    }
    /**
     * Verifies a given serialized value
     * {} String error code or null on success
     */
    verifySerializedValue(value: any): string | void { }
    /**
     * Deserializes a serialized value into the target object under the given key
     * {} String error code or null on success
     * @abstract
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        abstract;
    }
    /**
     * Returns the json schema
     */
    getAsJsonSchema(): any {
        const key: any = this.getCacheKey();
        const schema: any = this.getAsJsonSchemaUncached();
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
    getAsJsonSchemaUncached(): any {
        abstract;
    }
    /**
     * Returns whether null values are okay
     * {}
     */
    allowNull(): boolean {
        return false;
    }
    // Helper methods
    /**
     * Deserializes a serialized value, but performs integrity checks before
     * {} String error code or null on success
     */
    deserializeWithVerify(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        const errorCode: any = this.verifySerializedValue(value);
        if (errorCode) {
            return ("serialization verify failed: " +
                errorCode +
                " [value " +
                (JSON.stringify(value) || "").substr(0, 100) +
                "]");
        }
        return this.deserialize(value, targetObject, targetKey, root);
    }
    /**
     * Should return a cacheable key
     * @abstract
     */
    getCacheKey(): any {
        abstract;
        return "";
    }
}
export class TypeInteger extends BaseDataType {
    serialize(value: any): any {
        assert(Number.isInteger(value), "Type integer got non integer for serialize: " + value);
        return value;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = value;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "integer",
        };
    }
    verifySerializedValue(value: any): any {
        if (!Number.isInteger(value)) {
            return "Not a valid number";
        }
    }
    getCacheKey(): any {
        return "int";
    }
}
export class TypePositiveInteger extends BaseDataType {
    serialize(value: any): any {
        assert(Number.isInteger(value), "Type integer got non integer for serialize: " + value);
        assert(value >= 0, "value < 0: " + value);
        return value;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = value;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "integer",
            minimum: 0,
        };
    }
    verifySerializedValue(value: any): any {
        if (!Number.isInteger(value)) {
            return "Not a valid number";
        }
        if (value < 0) {
            return "Negative value for positive integer";
        }
    }
    getCacheKey(): any {
        return "uint";
    }
}
export class TypePositiveIntegerOrString extends BaseDataType {
    serialize(value: any): any {
        if (Number.isInteger(value)) {
            assert(value >= 0, "type integer got negative value: " + value);
        }
        else if (typeof value === "string") {
            // all good
        }
        else {
            assertAlways(false, "Type integer|string got non integer or string for serialize: " + value);
        }
        return value;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = value;
    }
    getAsJsonSchemaUncached(): any {
        return {
            oneOf: [{ type: "integer", minimum: 0 }, { type: "string" }],
        };
    }
    verifySerializedValue(value: any): any {
        if (Number.isInteger(value)) {
            if (value < 0) {
                return "Negative value for positive integer";
            }
        }
        else if (typeof value === "string") {
            // all good
        }
        else {
            return "Not a valid number or string: " + value;
        }
    }
    getCacheKey(): any {
        return "uint_str";
    }
}
export class TypeBoolean extends BaseDataType {
    serialize(value: any): any {
        assert(value === true || value === false, "Type bool got non bool for serialize: " + value);
        return value;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = value;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "boolean",
        };
    }
    verifySerializedValue(value: any): any {
        if (value !== true && value !== false) {
            return "Not a boolean";
        }
    }
    getCacheKey(): any {
        return "bool";
    }
}
export class TypeString extends BaseDataType {
    serialize(value: any): any {
        assert(typeof value === "string", "Type string got non string for serialize: " + value);
        return value;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = value;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "string",
        };
    }
    verifySerializedValue(value: any): any {
        if (typeof value !== "string") {
            return "Not a valid string";
        }
    }
    getCacheKey(): any {
        return "string";
    }
}
export class TypeVector extends BaseDataType {
    serialize(value: any): any {
        assert(value instanceof Vector, "Type vector got non vector for serialize: " + value);
        return {
            x: round4Digits(value.x),
            y: round4Digits(value.y),
        };
    }
    getAsJsonSchemaUncached(): any {
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
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = new Vector(value.x, value.y);
    }
    verifySerializedValue(value: any): any {
        if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) {
            return "Not a valid vector, missing x/y or bad data type";
        }
    }
    getCacheKey(): any {
        return "vector";
    }
}
export class TypeTileVector extends BaseDataType {
    serialize(value: any): any {
        assert(value instanceof Vector, "Type vector got non vector for serialize: " + value);
        assert(Number.isInteger(value.x) && value.x > 0, "Invalid tile x:" + value.x);
        assert(Number.isInteger(value.y) && value.y > 0, "Invalid tile x:" + value.y);
        return { x: value.x, y: value.y };
    }
    getAsJsonSchemaUncached(): any {
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
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = new Vector(value.x, value.y);
    }
    verifySerializedValue(value: any): any {
        if (!Number.isInteger(value.x) || !Number.isInteger(value.y)) {
            return "Not a valid tile vector, missing x/y or bad data type";
        }
        if (value.x < 0 || value.y < 0) {
            return "Invalid tile vector, x or y < 0";
        }
    }
    getCacheKey(): any {
        return "tilevector";
    }
}
export class TypeNumber extends BaseDataType {
    serialize(value: any): any {
        assert(Number.isFinite(value), "Type number got non number for serialize: " + value);
        assert(!Number.isNaN(value), "Value is nan: " + value);
        return round4Digits(value);
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "number",
        };
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = value;
    }
    verifySerializedValue(value: any): any {
        if (!Number.isFinite(value)) {
            return "Not a valid number: " + value;
        }
    }
    getCacheKey(): any {
        return "float";
    }
}
export class TypePositiveNumber extends BaseDataType {
    serialize(value: any): any {
        assert(Number.isFinite(value), "Type number got non number for serialize: " + value);
        assert(value >= 0, "Postitive number got negative value: " + value);
        return round4Digits(value);
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = value;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "number",
            minimum: 0,
        };
    }
    verifySerializedValue(value: any): any {
        if (!Number.isFinite(value)) {
            return "Not a valid number: " + value;
        }
        if (value < 0) {
            return "Positive number got negative value: " + value;
        }
    }
    getCacheKey(): any {
        return "ufloat";
    }
}
export class TypeEnum extends BaseDataType {
    public availableValues = Object.values(enumeration);

        constructor(enumeration = {}) {
        super();
    }
    serialize(value: any): any {
        assert(this.availableValues.indexOf(value) >= 0, "Unknown value: " + value);
        return value;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = value;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "string",
            enum: this.availableValues,
        };
    }
    verifySerializedValue(value: any): any {
        if (this.availableValues.indexOf(value) < 0) {
            return "Unknown enum value: " + value;
        }
    }
    getCacheKey(): any {
        return "enum." + this.availableValues.join(",");
    }
}
export class TypeEntity extends BaseDataType {
    serialize(value: any): any {
        // assert(value instanceof Entity, "Not a valid entity ref: " + value);
        assert(value.uid, "Entity has no uid yet");
        assert(!value.destroyed, "Entity already destroyed");
        assert(!value.queuedForDestroy, "Entity queued for destroy");
        return value.uid;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "integer",
            minimum: 0,
        };
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        const entity: any = root.entityMgr.findByUid(value);
        if (!entity) {
            return "Entity not found by uid: " + value;
        }
        targetObject[targetKey] = entity;
    }
    verifySerializedValue(value: any): any {
        if (!Number.isFinite(value)) {
            return "Not a valid uuid: " + value;
        }
    }
    getCacheKey(): any {
        return "entity";
    }
}
export class TypeEntityWeakref extends BaseDataType {
    serialize(value: any): any {
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
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        if (value === null) {
            targetObject[targetKey] = null;
            return;
        }
        const entity: any = root.entityMgr.findByUid(value, false);
        targetObject[targetKey] = entity;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: ["null", "integer"],
            minimum: 0,
        };
    }
    allowNull(): any {
        return true;
    }
    verifySerializedValue(value: any): any {
        if (value !== null && !Number.isFinite(value)) {
            return "Not a valid uuid: " + value;
        }
    }
    getCacheKey(): any {
        return "entity-weakref";
    }
}
export class TypeClass extends BaseDataType {
    public registry = registry;
    public customResolver = customResolver;

        constructor(registry, customResolver = null) {
        super();
    }
    serialize(value: any): any {
        assert(typeof value === "object", "Not a class instance: " + value);
        return {

            $: value.constructor.getId(),
            data: value.serialize(),
        };
    }
    getAsJsonSchemaUncached(): any {
        const options: any = [];
        const entries: any = this.registry.getEntries();
        for (let i: any = 0; i < entries.length; ++i) {
            const entry: any = entries[i];
            options.push(schemaObject({
                $: {
                    type: "string",
                    // @ts-ignore
                    enum: [entry.getId()],
                },
                // @ts-ignore
                data: schemaToJsonSchema(entry.getCachedSchema()),
            }));
        }
        return { oneOf: options };
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        let instance: any;
        if (this.customResolver) {
            instance = this.customResolver(root, value);
            if (!instance) {
                return "Failed to call custom resolver";
            }
        }
        else {
            const instanceClass: any = this.registry.findById(value.$);
            if (!instanceClass || !instanceClass.prototype) {
                return "Invalid class id (runtime-err): " + value.$ + "->" + instanceClass;
            }
            instance = Object.create(instanceClass.prototype);
            const errorState: any = instance.deserialize(value.data);
            if (errorState) {
                return errorState;
            }
        }
        targetObject[targetKey] = instance;
    }
    verifySerializedValue(value: any): any {
        if (!value) {
            return "Got null data";
        }
        if (!this.registry.hasId(value.$)) {
            return "Invalid class id: " + value.$ + " (factory is " + this.registry.getId() + ")";
        }
    }
    getCacheKey(): any {
        return "class." + this.registry.getId();
    }
}
export class TypeClassData extends BaseDataType {
    public registry = registry;

        constructor(registry) {
        super();
    }
    serialize(value: any): any {
        assert(typeof value === "object", "Not a class instance: " + value);
        return value.serialize();
    }
    getAsJsonSchemaUncached(): any {
        const options: any = [];
        const entries: any = this.registry.getEntries();
        for (let i: any = 0; i < entries.length; ++i) {
            const entry: any = entries[i];
            options.push(schemaToJsonSchema(entry as typeof BasicSerializableObject).getCachedSchema()));
        }
        return { oneOf: options };
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        assert(false, "can not deserialize class data of type " + this.registry.getId());
    }
    verifySerializedValue(value: any): any {
        if (!value) {
            return "Got null data";
        }
    }
    getCacheKey(): any {
        return "class." + this.registry.getId();
    }
}
export class TypeClassFromMetaclass extends BaseDataType {
    public registry = registry;
    public classHandle = classHandle;

        constructor(classHandle, registry) {
        super();
    }
    serialize(value: any): any {
        assert(typeof value === "object", "Not a class instance: " + value);
        return {
            $: value.getMetaclass().getId(),
            data: value.serialize(),
        };
    }
    getAsJsonSchemaUncached(): any {
        // const options = [];
        const ids: any = this.registry.getAllIds();
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
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        const metaClassInstance: any = this.registry.findById(value.$);
        if (!metaClassInstance || !metaClassInstance.prototype) {
            return "Invalid meta class id (runtime-err): " + value.$ + "->" + metaClassInstance;
        }
        const instanceClass: any = metaClassInstance.getInstanceClass();
        const instance: any = Object.create(instanceClass.prototype);
        const errorState: any = instance.deserialize(value.data);
        if (errorState) {
            return errorState;
        }
        targetObject[targetKey] = instance;
    }
    verifySerializedValue(value: any): any {
        if (!value) {
            return "Got null data";
        }
        if (!this.registry.hasId(value.$)) {
            return "Invalid class id: " + value.$ + " (factory is " + this.registry.getId() + ")";
        }
    }
    getCacheKey(): any {
        return "classofmetaclass." + this.registry.getId();
    }
}
export class TypeMetaClass extends BaseDataType {
    public registry = registry;

        constructor(registry) {
        super();
    }
    serialize(value: any): any {
        return value.getId();
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        const instanceClass: any = this.registry.findById(value);
        if (!instanceClass) {
            return "Invalid class id (runtime-err): " + value;
        }
        targetObject[targetKey] = instanceClass;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "string",
            enum: this.registry.getAllIds(),
        };
    }
    verifySerializedValue(value: any): any {
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
    getCacheKey(): any {
        return "metaclass." + this.registry.getId();
    }
}
export class TypeArray extends BaseDataType {
    public fixedSize = fixedSize;
    public innerType = innerType;

        constructor(innerType, fixedSize = false) {
        super();
    }
    serialize(value: any): any {
        assert(Array.isArray(value), "Not an array");
        const result: any = new Array(value.length);
        for (let i: any = 0; i < value.length; ++i) {
            result[i] = this.innerType.serialize(value[i]);
        }
        return result;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        let destination: any = targetObject[targetKey];
        if (!destination) {
            targetObject[targetKey] = destination = new Array(value.length);
        }
        const size: any = this.fixedSize ? Math.min(value.length, destination.length) : value.length;
        for (let i: any = 0; i < size; ++i) {
            const errorStatus: any = this.innerType.deserializeWithVerify(value[i], destination, i, root);
            if (errorStatus) {
                return errorStatus;
            }
        }
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "array",
            items: this.innerType.getAsJsonSchema(),
        };
    }
    verifySerializedValue(value: any): any {
        if (!Array.isArray(value)) {
            return "Not an array: " + value;
        }
    }
    getCacheKey(): any {
        return "array." + this.innerType.getCacheKey();
    }
}
export class TypeFixedClass extends BaseDataType {
    public baseclass = baseclass;

        constructor(baseclass) {
        super();
    }
    serialize(value: any): any {
        assert(value instanceof this.baseclass, "Not a valid class instance");
        return value.serialize();
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        const instance: any = Object.create(this.baseclass.prototype);
        const errorState: any = instance.deserialize(value);
        if (errorState) {
            return "Failed to deserialize class: " + errorState;
        }
        targetObject[targetKey] = instance;
    }
    getAsJsonSchemaUncached(): any {
        this.baseclass.getSchema();
        this.baseclass.getCachedSchema();
        return schemaToJsonSchema(this.baseclass.getCachedSchema());
    }
    verifySerializedValue(value: any): any {
        if (!value) {
            return "Got null data";
        }
    }
    getCacheKey(): any {
        return "fixedclass." + this.baseclass.getId();
    }
}
export class TypeKeyValueMap extends BaseDataType {
    public valueType = valueType;
    public includeEmptyValues = includeEmptyValues;

        constructor(valueType, includeEmptyValues = true) {
        super();
    }
    serialize(value: any): any {
        assert(typeof value === "object", "not an object");
        let result: any = {};
        for (const key: any in value) {
            const serialized: any = this.valueType.serialize(value[key]);
            if (!this.includeEmptyValues && typeof serialized === "object") {
                if (serialized.$ &&
                    typeof serialized.data === "object" &&
                    Object.keys(serialized.data).length === 0) {
                    continue;
                }
                else if (Object.keys(serialized).length === 0) {
                    continue;
                }
            }
            result[key] = serialized;
        }
        return result;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        let result: any = {};
        for (const key: any in value) {
            const errorCode: any = this.valueType.deserializeWithVerify(value[key], result, key, root);
            if (errorCode) {
                return errorCode;
            }
        }
        targetObject[targetKey] = result;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "object",
            additionalProperties: this.valueType.getAsJsonSchema(),
        };
    }
    verifySerializedValue(value: any): any {
        if (typeof value !== "object") {
            return "KV map is not an object";
        }
    }
    getCacheKey(): any {
        return "kvmap." + this.valueType.getCacheKey();
    }
}
export class TypeClassId extends BaseDataType {
    public registry = registry;

        constructor(registry) {
        super();
    }
    serialize(value: any): any {
        assert(typeof value === "string", "Not a valid string");
        assert(this.registry.hasId(value), "Id " + value + " not found in registry");
        return value;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        targetObject[targetKey] = value;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "string",
            enum: this.registry.getAllIds(),
        };
    }
    verifySerializedValue(value: any): any {
        if (typeof value !== "string") {
            return "Not a valid registry id key: " + value;
        }
        if (!this.registry.hasId(value)) {
            return "Id " + value + " not known to registry";
        }
    }
    getCacheKey(): any {
        return "classid." + this.registry.getId();
    }
}
export class TypePair extends BaseDataType {
    public type1 = type1;
    public type2 = type2;

        constructor(type1, type2) {
        super();
        assert(type1 && type1 instanceof BaseDataType, "bad first type given for pair");
        assert(type2 && type2 instanceof BaseDataType, "bad second type given for pair");
    }
    serialize(value: any): any {
        assert(Array.isArray(value), "pair: not an array");
        assert(value.length === 2, "pair: length != 2");
        return [this.type1.serialize(value[0]), this.type2.serialize(value[1])];
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        const result: any = [undefined, undefined];
        let errorCode: any = this.type1.deserialize(value[0], result, 0, root);
        if (errorCode) {
            return errorCode;
        }
        errorCode = this.type2.deserialize(value[1], result, 1, root);
        if (errorCode) {
            return errorCode;
        }
        targetObject[targetKey] = result;
    }
    getAsJsonSchemaUncached(): any {
        return {
            type: "array",
            minLength: 2,
            maxLength: 2,
            items: [this.type1.getAsJsonSchema(), this.type2.getAsJsonSchema()],
        };
    }
    verifySerializedValue(value: any): any {
        if (!Array.isArray(value)) {
            return "Pair is not an array";
        }
        if (value.length !== 2) {
            return "Pair length != 2";
        }
        let errorCode: any = this.type1.verifySerializedValue(value[0]);
        if (errorCode) {
            return errorCode;
        }
        errorCode = this.type2.verifySerializedValue(value[1]);
        if (errorCode) {
            return errorCode;
        }
    }
    getCacheKey(): any {
        return "pair.(" + this.type1.getCacheKey() + "," + this.type2.getCacheKey + ")";
    }
}
export class TypeNullable extends BaseDataType {
    public wrapped = wrapped;

        constructor(wrapped) {
        super();
    }
    serialize(value: any): any {
        if (value === null || value === undefined) {
            return null;
        }
        return this.wrapped.serialize(value);
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        if (value === null || value === undefined) {
            targetObject[targetKey] = null;
            return;
        }
        return this.wrapped.deserialize(value, targetObject, targetKey, root);
    }
    verifySerializedValue(value: any): any {
        if (value === null) {
            return;
        }
        return this.wrapped.verifySerializedValue(value);
    }
    getAsJsonSchemaUncached(): any {
        return {
            oneOf: [
                {
                    type: "null",
                },
                this.wrapped.getAsJsonSchema(),
            ],
        };
    }
    allowNull(): any {
        return true;
    }
    getCacheKey(): any {
        return "nullable." + this.wrapped.getCacheKey();
    }
}
export class TypeStructuredObject extends BaseDataType {
    public descriptor = descriptor;

        constructor(descriptor) {
        super();
    }
    serialize(value: any): any {
        assert(typeof value === "object", "not an object");
        let result: any = {};
        for (const key: any in this.descriptor) {
            // assert(value.hasOwnProperty(key), "Serialization: Object does not have", key, "property!");
            result[key] = this.descriptor[key].serialize(value[key]);
        }
        return result;
    }
    /**
     * @see BaseDataType.deserialize
     * {} String error code or null on success
     */
    deserialize(value: any, targetObject: object, targetKey: string | number, root: GameRoot): string | void {
        let target: any = targetObject[targetKey];
        if (!target) {
            targetObject[targetKey] = target = {};
        }
        for (const key: any in value) {
            const valueType: any = this.descriptor[key];
            const errorCode: any = valueType.deserializeWithVerify(value[key], target, key, root);
            if (errorCode) {
                return errorCode;
            }
        }
    }
    getAsJsonSchemaUncached(): any {
        let properties: any = {};
        for (const key: any in this.descriptor) {
            properties[key] = this.descriptor[key].getAsJsonSchema();
        }
        return {
            type: "object",
            required: Object.keys(this.descriptor),
            properties,
        };
    }
    verifySerializedValue(value: any): any {
        if (typeof value !== "object") {
            return "structured object is not an object";
        }
        for (const key: any in this.descriptor) {
            if (!value.hasOwnProperty(key)) {
                return "structured object is missing key " + key;
            }
            const subError: any = this.descriptor[key].verifySerializedValue(value[key]);
            if (subError) {
                return "structured object::" + subError;
            }
        }
    }
    getCacheKey(): any {
        let props: any = [];
        for (const key: any in this.descriptor) {
            props.push(key + "=" + this.descriptor[key].getCacheKey());
        }
        return "structured[" + props.join(",") + "]";
    }
}
