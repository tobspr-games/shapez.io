/* typehints:start */
import { Component } from "./component";
import { Entity } from "./entity";
/* typehints:end */

import { GameRoot, enumLayer } from "./root";
import { GameSystem } from "./game_system";
import { arrayDelete, arrayDeleteValue } from "../core/utils";
import { DrawParameters } from "../core/draw_parameters";
import { globalConfig } from "../core/config";
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
         * @type {Array<Entity>}
         */
        this.allEntities = [];

        this.root.signals.entityAdded.add(this.internalPushEntityIfMatching, this);
        this.root.signals.entityGotNewComponent.add(this.internalReconsiderEntityToAdd, this);
        this.root.signals.entityComponentRemoved.add(this.internalCheckEntityAfterComponentRemoval, this);
        this.root.signals.entityQueuedForDestroy.add(this.internalPopEntityIfMatching, this);

        this.root.signals.postLoadHook.add(this.internalPostLoadHook, this);
        this.root.signals.bulkOperationFinished.add(this.refreshCaches, this);
    }

    /**
     * Calls a function for each matching entity on the screen, useful for drawing them
     * @param {DrawParameters} parameters
     * @param {function} callback
     * @param {enumLayer=} layerFilter Can be null for no filter
     */
    forEachMatchingEntityOnScreen(parameters, callback, layerFilter = null) {
        const cullRange = parameters.visibleRect.toTileCullRectangle();
        if (this.allEntities.length < 100) {
            // So, its much quicker to simply perform per-entity checking

            for (let i = 0; i < this.allEntities.length; ++i) {
                const entity = this.allEntities[i];
                if (cullRange.containsRect(entity.components.StaticMapEntity.getTileSpaceBounds())) {
                    if (!layerFilter || entity.layer === layerFilter) {
                        callback(parameters, entity);
                    }
                }
            }
            return;
        }

        const top = cullRange.top();
        const right = cullRange.right();
        const bottom = cullRange.bottom();
        const left = cullRange.left();

        const border = 1;
        const minY = top - border;
        const maxY = bottom + border;
        const minX = left - border;
        const maxX = right + border - 1;

        const map = this.root.map;

        let seenUids = new Set();

        const chunkStartX = Math.floor(minX / globalConfig.mapChunkSize);
        const chunkStartY = Math.floor(minY / globalConfig.mapChunkSize);

        const chunkEndX = Math.ceil(maxX / globalConfig.mapChunkSize);
        const chunkEndY = Math.ceil(maxY / globalConfig.mapChunkSize);

        const requiredComponents = this.requiredComponentIds;

        // Render y from top down for proper blending
        for (let chunkX = chunkStartX; chunkX <= chunkEndX; ++chunkX) {
            for (let chunkY = chunkStartY; chunkY <= chunkEndY; ++chunkY) {
                const chunk = map.getChunk(chunkX, chunkY, false);
                if (!chunk) {
                    continue;
                }

                // BIG TODO: CULLING ON AN ENTITY BASIS

                const entities = chunk.containedEntities;
                entityLoop: for (let i = 0; i < entities.length; ++i) {
                    const entity = entities[i];

                    // Avoid drawing non-layer contents
                    if (layerFilter && entity.layer !== layerFilter) {
                        continue;
                    }

                    // Avoid drawing twice
                    if (seenUids.has(entity.uid)) {
                        continue;
                    }

                    seenUids.add(entity.uid);

                    for (let i = 0; i < requiredComponents.length; ++i) {
                        if (!entity.components[requiredComponents[i]]) {
                            continue entityLoop;
                        }
                    }
                    callback(parameters, entity);
                }
            }
        }
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

        assert(this.allEntities.indexOf(entity) < 0, "entity already in list: " + entity);
        this.internalRegisterEntity(entity);
    }

    /**
     *
     * @param {Entity} entity
     */
    internalCheckEntityAfterComponentRemoval(entity) {
        if (this.allEntities.indexOf(entity) < 0) {
            // Entity wasn't interesting anyways
            return;
        }

        for (let i = 0; i < this.requiredComponentIds.length; ++i) {
            if (!entity.components[this.requiredComponentIds[i]]) {
                // Entity is not interesting anymore
                arrayDeleteValue(this.allEntities, entity);
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
        if (this.allEntities.indexOf(entity) >= 0) {
            return;
        }
        this.internalRegisterEntity(entity);
    }

    refreshCaches() {
        this.allEntities.sort((a, b) => a.uid - b.uid);

        // Remove all entities which are queued for destroy
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            if (entity.queuedForDestroy || entity.destroyed) {
                this.allEntities.splice(i, 1);
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
        this.allEntities.push(entity);

        if (this.root.gameInitialized && !this.root.bulkOperationRunning) {
            // Sort entities by uid so behaviour is predictable
            this.allEntities.sort((a, b) => a.uid - b.uid);
        }
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
        const index = this.allEntities.indexOf(entity);
        if (index >= 0) {
            arrayDelete(this.allEntities, index);
        }
    }
}
