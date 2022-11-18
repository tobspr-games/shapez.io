import { arrayDeleteValue, newEmptyMap, fastArrayDeleteValue } from "../core/utils";
import { Component } from "./component";
import { GameRoot } from "./root";
import { Entity } from "./entity";
import { BasicSerializableObject, types } from "../savegame/serialization";
import { createLogger } from "../core/logging";
import { globalConfig } from "../core/config";
const logger: any = createLogger("entity_manager");
// Manages all entities
// NOTICE: We use arrayDeleteValue instead of fastArrayDeleteValue since that does not preserve the order
// This is slower but we need it for the street path generation
export class EntityManager extends BasicSerializableObject {
    public root: GameRoot = root;
    public entities: Array<Entity> = [];
    public destroyList: Array<Entity> = [];
    public componentToEntity: {
        [idx: string]: Array<Entity>;
    } = newEmptyMap();
    public nextUid = 10000;

    constructor(root) {
        super();
    }
    static getId(): any {
        return "EntityManager";
    }
    static getSchema(): any {
        return {
            nextUid: types.uint,
        };
    }
    getStatsText(): any {
        return this.entities.length + " entities [" + this.destroyList.length + " to kill]";
    }
    // Main update
    update(): any {
        this.processDestroyList();
    }
    /**
     * Registers a new entity
     */
    registerEntity(entity: Entity, uid: number= = null): any {
        if (G_IS_DEV && !globalConfig.debug.disableSlowAsserts) {
            assert(this.entities.indexOf(entity) < 0, `RegisterEntity() called twice for entity ${entity}`);
        }
        assert(!entity.destroyed, `Attempting to register destroyed entity ${entity}`);
        if (G_IS_DEV && !globalConfig.debug.disableSlowAsserts && uid !== null) {
            assert(!this.findByUid(uid, false), "Entity uid already taken: " + uid);
            assert(uid >= 0 && uid < Number.MAX_SAFE_INTEGER, "Invalid uid passed: " + uid);
        }
        this.entities.push(entity);
        // Register into the componentToEntity map
        for (const componentId: any in entity.components) {
            if (entity.components[componentId]) {
                if (this.componentToEntity[componentId]) {
                    this.componentToEntity[componentId].push(entity);
                }
                else {
                    this.componentToEntity[componentId] = [entity];
                }
            }
        }
        // Give each entity a unique id
        entity.uid = uid ? uid : this.generateUid();
        entity.registered = true;
        this.root.signals.entityAdded.dispatch(entity);
    }
    /**
     * Generates a new uid
     * {}
     */
    generateUid(): number {
        return this.nextUid++;
    }
    /**
     * Call to attach a new component after the creation of the entity
     */
    attachDynamicComponent(entity: Entity, component: Component): any {
        entity.addComponent(component, true);

        const componentId: any = (component.constructor as typeof Component).getId();
        if (this.componentToEntity[componentId]) {
            this.componentToEntity[componentId].push(entity);
        }
        else {
            this.componentToEntity[componentId] = [entity];
        }
        this.root.signals.entityGotNewComponent.dispatch(entity);
    }
    /**
     * Call to remove a component after the creation of the entity
     */
    removeDynamicComponent(entity: Entity, component: typeof Component): any {
        entity.removeComponent(component, true);

        const componentId: any = (component.constructor as typeof Component).getId();
        fastArrayDeleteValue(this.componentToEntity[componentId], entity);
        this.root.signals.entityComponentRemoved.dispatch(entity);
    }
    /**
     * Finds an entity buy its uid, kinda slow since it loops over all entities
     * {}
     */
    findByUid(uid: number, errorWhenNotFound: boolean= = true): Entity {
        const arr: any = this.entities;
        for (let i: any = 0, len: any = arr.length; i < len; ++i) {
            const entity: any = arr[i];
            if (entity.uid === uid) {
                if (entity.queuedForDestroy || entity.destroyed) {
                    if (errorWhenNotFound) {
                        logger.warn("Entity with UID", uid, "not found (destroyed)");
                    }
                    return null;
                }
                return entity;
            }
        }
        if (errorWhenNotFound) {
            logger.warn("Entity with UID", uid, "not found");
        }
        return null;
    }
    /**
     * Returns a map which gives a mapping from UID to Entity.
     * This map is not updated.
     *
     * {}
     */
    getFrozenUidSearchMap(): Map<number, Entity> {
        const result: any = new Map();
        const array: any = this.entities;
        for (let i: any = 0, len: any = array.length; i < len; ++i) {
            const entity: any = array[i];
            if (!entity.queuedForDestroy && !entity.destroyed) {
                result.set(entity.uid, entity);
            }
        }
        return result;
    }
    /**
     * Returns all entities having the given component
     * {} entities
     */
    getAllWithComponent(componentHandle: typeof Component): Array<Entity> {
        return this.componentToEntity[componentHandle.getId()] || [];
    }
    /**
     * Unregisters all components of an entity from the component to entity mapping
     */
    unregisterEntityComponents(entity: Entity): any {
        for (const componentId: any in entity.components) {
            if (entity.components[componentId]) {
                arrayDeleteValue(this.componentToEntity[componentId], entity);
            }
        }
    }
    // Processes the entities to destroy and actually destroys them
    /* eslint-disable max-statements */
    processDestroyList(): any {
        for (let i: any = 0; i < this.destroyList.length; ++i) {
            const entity: any = this.destroyList[i];
            // Remove from entities list
            arrayDeleteValue(this.entities, entity);
            // Remove from componentToEntity list
            this.unregisterEntityComponents(entity);
            entity.registered = false;
            entity.destroyed = true;
            this.root.signals.entityDestroyed.dispatch(entity);
        }
        this.destroyList = [];
    }
    /**
     * Queues an entity for destruction
     */
    destroyEntity(entity: Entity): any {
        if (entity.destroyed) {
            logger.error("Tried to destroy already destroyed entity:", entity.uid);
            return;
        }
        if (entity.queuedForDestroy) {
            logger.error("Trying to destroy entity which is already queued for destroy!", entity.uid);
            return;
        }
        if (this.destroyList.indexOf(entity) < 0) {
            this.destroyList.push(entity);
            entity.queuedForDestroy = true;
            this.root.signals.entityQueuedForDestroy.dispatch(entity);
        }
        else {
            assert(false, "Trying to destroy entity twice");
        }
    }
}
