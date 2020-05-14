/* typehints:start */
import { GameRoot } from "../game/root";
/* typehints:end */

import { gComponentRegistry } from "../core/global_registries";
import { createLogger } from "../core/logging";
import { Entity } from "../game/entity";

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
                serialized.push(entity.serialize());
            }
        }
        return serialized;
    }

    /**
     *
     * @param {GameRoot} root
     * @param {Array<any>} array
     * @returns {string|void}
     */
    deserializeEntityArray(root, array) {
        for (let i = 0; i < array.length; ++i) {
            this.deserializeEntity(root, array[i]);
        }
    }

    /**
     *
     * @param {GameRoot} root
     * @param {Entity} payload
     */
    deserializeEntity(root, payload) {
        const entity = new Entity(null);
        this.deserializeComponents(entity, payload.components);

        root.entityMgr.registerEntity(entity, payload.uid);

        if (entity.components.StaticMapEntity) {
            root.map.placeStaticEntity(entity);
        }
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
            const componentClass = gComponentRegistry.findById(componentId);
            const componentHandle = new componentClass({});
            entity.addComponent(componentHandle);
            const errorStatus = componentHandle.deserialize(data[componentId]);
            if (errorStatus) {
                return errorStatus;
            }
        }
    }
}
