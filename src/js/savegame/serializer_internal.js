/* typehints:start */
import { GameRoot } from "../game/root";
/* typehints:end */

import { Vector } from "../core/vector";
import { createLogger } from "../core/logging";
import { gMetaBuildingRegistry } from "../core/global_registries";
import { Entity } from "../game/entity";

const logger = createLogger("serializer_internal");

// Internal serializer methods
export class SerializerInternal {
    constructor() {}

    /**
     * Serializes an array of entities
     * @param {Array<Entity>} array
     */
    serializeEntityArray(array) {
        const serialized = [];
        for (let i = 0; i < array.length; ++i) {
            const entity = array[i];
            if (!entity.queuedForDestroy && !entity.destroyed) {
                serialized.push({
                    $: entity.getMetaclass().getId(),
                    data: entity.serialize(),
                });
            }
        }
        return serialized;
    }

    /**
     * Serializes an array of entities where we know the type of
     * @param {Array<Entity>} array
     */
    serializeEntityArrayFixedType(array) {
        const serialized = [];
        for (let i = 0; i < array.length; ++i) {
            const entity = array[i];
            if (!entity.queuedForDestroy && !entity.destroyed) {
                serialized.push(entity.serialize());
            }
        }
        return serialized;
    }

    /**
     *
     * @param {GameRoot} root
     * @param {Array<any>} array
     * @param {function(GameRoot, { $: string, data: object }):string|void} deserializerMethod
     * @returns {string|void}
     */
    deserializeEntityArray(root, array, deserializerMethod) {
        for (let i = 0; i < array.length; ++i) {
            const errorState = deserializerMethod.call(this, root, array[i]);
            if (errorState) {
                return errorState;
            }
        }
        return null;
    }

    /**
     *
     * @param {GameRoot} root
     * @param {Array<any>} array
     * @param {function(GameRoot, object):string|void} deserializerMethod
     * @returns {string|void}
     */
    deserializeEntityArrayFixedType(root, array, deserializerMethod) {
        for (let i = 0; i < array.length; ++i) {
            const errorState = deserializerMethod.call(this, root, array[i]);
            if (errorState) {
                return errorState;
            }
        }
        return null;
    }

    /**
     * Deserializes a building
     * @param {GameRoot} root
     * @param {{ $: string, data: any }} payload
     */
    deserializeBuilding(root, payload) {
        const data = payload.data;
        const id = payload.$;
        if (!gMetaBuildingRegistry.hasId(id)) {
            return "Metaclass not found for building: '" + id + "'";
        }
        const meta = gMetaBuildingRegistry.findById(id);
        if (!meta) {
            return "Metaclass not found for building: '" + id + "'";
        }

        const tile = new Vector(data.x, data.y).toTileSpace();
        const instance = root.logic.internalPlaceBuildingLocalClientOnly({
            tile: tile,
            metaBuilding: meta,
            uid: data.uid,
        });

        // Apply component specific properties
        const errorStatus = this.deserializeComponents(instance, data.components);
        if (errorStatus) {
            return errorStatus;
        }

        // Apply enhancements
        instance.updateEnhancements();
    }

    /**
     * Deserializes a blueprint
     * @param {GameRoot} root
     * @param {any} data
     * @returns {string|void}
     */
    deserializeBlueprint(root, data) {
        const id = data.meta;
        const metaClass = gMetaBuildingRegistry.findById(id);
        if (!metaClass) {
            return "Metaclass not found for blueprint: '" + id + "'";
        }

        const tile = new Vector(data.x, data.y).toTileSpace();
        const instance = root.logic.internalPlaceBlueprintLocalClientOnly({
            tile: tile,
            metaBuilding: metaClass,
            uid: data.uid,
        });
        return this.deserializeComponents(instance, data.components);
    }

    /////// COMPONENTS ////

    /**
     * Deserializes components of an entity
     * @param {Entity} entity
     * @param {Object.<string, any>} data
     * @returns {string|void}
     */
    deserializeComponents(entity, data) {
        for (const componentId in data) {
            const componentHandle = entity.components[componentId];
            if (!componentHandle) {
                logger.warn(
                    "Loading outdated savegame, where entity had component",
                    componentId,
                    "but now no longer has"
                );
                continue;
            }
            const componentData = data[componentId];
            const errorStatus = componentHandle.deserialize(componentData);
            if (errorStatus) {
                return errorStatus;
            }
        }
    }

    /**
     * Deserializes a resource
     * @param {GameRoot} root
     * @param {object} data
     * @returns {string|void}
     */
    deserializeResource(root, data) {
        const id = data.key;
        const instance = new MapResource(root, this.neutralFaction, id);
        root.logic.internalPlaceMapEntityLocalClientOnly(
            new Vector(data.x, data.y).toTileSpace(),
            instance,
            data.uid
        );
    }
}
