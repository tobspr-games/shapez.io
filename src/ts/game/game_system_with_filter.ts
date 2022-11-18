/* typehints:start */
import type { Component } from "./component";
import type { Entity } from "./entity";
/* typehints:end */
import { GameRoot } from "./root";
import { GameSystem } from "./game_system";
import { arrayDelete, arrayDeleteValue } from "../core/utils";
import { globalConfig } from "../core/config";
export class GameSystemWithFilter extends GameSystem {
    public requiredComponents = requiredComponents;
    public requiredComponentIds = requiredComponents.map((component: any): any => component.getId());
    public allEntities: Array<Entity> = [];
    /**
     * Constructs a new game system with the given component filter. It will process
     * all entities which have *all* of the passed components
     */

    constructor(root, requiredComponents) {
        super(root);
        this.root.signals.entityAdded.add(this.internalPushEntityIfMatching, this);
        this.root.signals.entityGotNewComponent.add(this.internalReconsiderEntityToAdd, this);
        this.root.signals.entityComponentRemoved.add(this.internalCheckEntityAfterComponentRemoval, this);
        this.root.signals.entityQueuedForDestroy.add(this.internalPopEntityIfMatching, this);
        this.root.signals.postLoadHook.add(this.internalPostLoadHook, this);
        this.root.signals.bulkOperationFinished.add(this.refreshCaches, this);
    }
        internalPushEntityIfMatching(entity: Entity): any {
        for (let i: any = 0; i < this.requiredComponentIds.length; ++i) {
            if (!entity.components[this.requiredComponentIds[i]]) {
                return;
            }
        }
        // This is slow!
        if (G_IS_DEV && !globalConfig.debug.disableSlowAsserts) {
            assert(this.allEntities.indexOf(entity) < 0, "entity already in list: " + entity);
        }
        this.internalRegisterEntity(entity);
    }
        internalCheckEntityAfterComponentRemoval(entity: Entity): any {
        if (this.allEntities.indexOf(entity) < 0) {
            // Entity wasn't interesting anyways
            return;
        }
        for (let i: any = 0; i < this.requiredComponentIds.length; ++i) {
            if (!entity.components[this.requiredComponentIds[i]]) {
                // Entity is not interesting anymore
                arrayDeleteValue(this.allEntities, entity);
            }
        }
    }
        internalReconsiderEntityToAdd(entity: Entity): any {
        for (let i: any = 0; i < this.requiredComponentIds.length; ++i) {
            if (!entity.components[this.requiredComponentIds[i]]) {
                return;
            }
        }
        if (this.allEntities.indexOf(entity) >= 0) {
            return;
        }
        this.internalRegisterEntity(entity);
    }
    refreshCaches(): any {
        // Remove all entities which are queued for destroy
        for (let i: any = 0; i < this.allEntities.length; ++i) {
            const entity: any = this.allEntities[i];
            if (entity.queuedForDestroy || entity.destroyed) {
                this.allEntities.splice(i, 1);
                i -= 1;
            }
        }
        this.allEntities.sort((a: any, b: any): any => a.uid - b.uid);
    }
    /**
     * Recomputes all target entities after the game has loaded
     */
    internalPostLoadHook(): any {
        this.refreshCaches();
    }
        internalRegisterEntity(entity: Entity): any {
        this.allEntities.push(entity);
        if (this.root.gameInitialized && !this.root.bulkOperationRunning) {
            // Sort entities by uid so behaviour is predictable
            this.allEntities.sort((a: any, b: any): any => a.uid - b.uid);
        }
    }
        internalPopEntityIfMatching(entity: Entity): any {
        if (this.root.bulkOperationRunning) {
            // We do this in refreshCaches afterwards
            return;
        }
        const index: any = this.allEntities.indexOf(entity);
        if (index >= 0) {
            arrayDelete(this.allEntities, index);
        }
    }
}
