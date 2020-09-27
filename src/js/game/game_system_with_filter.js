/* typehints:start */
import { Component } from "./component";
import { Entity } from "./entity";
/* typehints:end */

import { GameRoot } from "./root";
import { GameSystem } from "./game_system";
import { arrayDelete, arrayDeleteValue, fastArrayDelete } from "../core/utils";

export class GameSystemWithFilter extends GameSystem {
    /**
     * Constructs a new game system with the given component filter. It will process
     * all entities which have *all* of the passed components
     * @param {GameRoot} root
     * @param {Array<typeof Component>} requiredComponents
     */
    constructor(root, requiredComponents) {
        super(root);
        this.requiredComponents = requiredComponents;
        this.requiredComponentIds = requiredComponents.map(component => component.getId());

        /**
         * All entities which match the current components
         * @type {Set<Entity>}
         */
        this.allEntitiesSet = new Set();
        this.allEntitiesArray = [];
        this.allEntitiesArrayIsOutdated = true;

        this.root.signals.entityAdded.add(this.internalPushEntityIfMatching, this);
        this.root.signals.entityGotNewComponent.add(this.internalReconsiderEntityToAdd, this);
        this.root.signals.entityComponentRemoved.add(this.internalCheckEntityAfterComponentRemoval, this);
        this.root.signals.entityQueuedForDestroy.add(this.internalPopEntityIfMatching, this);

        this.root.signals.postLoadHook.add(this.internalPostLoadHook, this);
        this.root.signals.bulkOperationFinished.add(this.refreshCaches, this);
    }

    tryUpdateEntitiesArray() {
        this.allEntitiesArray = [...this.allEntitiesSet.values()];
    }

    /**
     * @param {Entity} entity
     */
    internalPushEntityIfMatching(entity) {
        for (let i = 0; i < this.requiredComponentIds.length; ++i) {
            if (!entity.components[this.requiredComponentIds[i]]) {
                return;
            }
        }

        assert(!this.allEntitiesSet.has(entity), "entity already in list: " + entity);
        this.internalRegisterEntity(entity);
    }

    /**
     *
     * @param {Entity} entity
     */
    internalCheckEntityAfterComponentRemoval(entity) {
        if (!this.allEntitiesSet.has(entity)) {
            // Entity wasn't interesting anyways
            return;
        }

        for (let i = 0; i < this.requiredComponentIds.length; ++i) {
            if (!entity.components[this.requiredComponentIds[i]]) {
                // Entity is not interesting anymore
                //arrayDeleteValue(this.allEntities, entity);
                this.allEntitiesArrayIsOutdated = this.allEntitiesSet.delete(entity);
            }
        }
    }

    /**
     *
     * @param {Entity} entity
     */
    internalReconsiderEntityToAdd(entity) {
        for (let i = 0; i < this.requiredComponentIds.length; ++i) {
            if (!entity.components[this.requiredComponentIds[i]]) {
                return;
            }
        }
        if (this.allEntitiesSet.has(entity)) {
            return;
        }
        this.internalRegisterEntity(entity);
    }

    refreshCaches() {
        //this.allEntities.sort((a, b) => a.uid - b.uid);
        // Remove all entities which are queued for destroy

        this.tryUpdateEntitiesArray();

        for (let i = 0; i < this.allEntitiesArray.length; ++i) {
            const entity = this.allEntitiesArray[i];
            if (entity.queuedForDestroy || entity.destroyed) {
                this.allEntitiesSet.delete(this.allEntitiesArray[i]);
                fastArrayDelete(this.allEntitiesArray, i);
            }
        }
    }

    /**
     * Recomputes all target entities after the game has loaded
     */
    internalPostLoadHook() {
        this.refreshCaches();
    }

    /**
     *
     * @param {Entity} entity
     */
    internalRegisterEntity(entity) {
        this.allEntitiesSet.add(entity);
        this.allEntitiesArray.push(entity);

        // if (this.root.gameInitialized && !this.root.bulkOperationRunning) {
        //     // Sort entities by uid so behaviour is predictable
        //     this.allEntities.sort((a, b) => a.uid - b.uid);
        // }
    }

    /**
     *
     * @param {Entity} entity
     */
    internalPopEntityIfMatching(entity) {
        if (this.root.bulkOperationRunning) {
            // We do this in refreshCaches afterwards
            return;
        }
        this.allEntitiesArrayIsOutdated = this.allEntitiesSet.delete(entity);
    }
}
