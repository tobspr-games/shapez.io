import { Math_sqrt } from "../../core/builtins";
import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { createLogger } from "../../core/logging";
import { AtlasSprite } from "../../core/sprites";
import { enumDirection, enumDirectionToVector, enumInvertedDirections } from "../../core/vector";
import { BeltPath } from "../belt_path";
import { BeltComponent } from "../components/belt";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { fastArrayDeleteValue } from "../../core/utils";

export const BELT_ANIM_COUNT = 28;

const logger = createLogger("belt");

export class BeltSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BeltComponent]);
        /**
         * @type {Object.<enumDirection, Array<AtlasSprite>>}
         */
        this.beltSprites = {
            [enumDirection.top]: Loader.getSprite("sprites/belt/forward_0.png"),
            [enumDirection.left]: Loader.getSprite("sprites/belt/left_0.png"),
            [enumDirection.right]: Loader.getSprite("sprites/belt/right_0.png"),
        };

        /**
         * @type {Object.<enumDirection, Array<AtlasSprite>>}
         */
        this.beltAnimations = {
            [enumDirection.top]: [],
            [enumDirection.left]: [],
            [enumDirection.right]: [],
        };

        for (let i = 0; i < BELT_ANIM_COUNT; ++i) {
            this.beltAnimations[enumDirection.top].push(
                Loader.getSprite("sprites/belt/forward_" + i + ".png")
            );
            this.beltAnimations[enumDirection.left].push(Loader.getSprite("sprites/belt/left_" + i + ".png"));
            this.beltAnimations[enumDirection.right].push(
                Loader.getSprite("sprites/belt/right_" + i + ".png")
            );
        }

        this.root.signals.entityAdded.add(this.updateSurroundingBeltPlacement, this);
        this.root.signals.entityDestroyed.add(this.updateSurroundingBeltPlacement, this);
        this.root.signals.entityDestroyed.add(this.onEntityDestroyed, this);
        this.root.signals.entityAdded.add(this.onEntityAdded, this);
        this.root.signals.postLoadHook.add(this.computeBeltCache, this);

        // /** @type {Rectangle} */
        // this.areaToRecompute = null;

        /** @type {Array<BeltPath>} */
        this.beltPaths = [];

        this.recomputePaths = true;
    }

    /**
     * Updates the belt placement after an entity has been added / deleted
     * @param {Entity} entity
     */
    updateSurroundingBeltPlacement(entity) {
        if (!this.root.gameInitialized) {
            return;
        }

        const staticComp = entity.components.StaticMapEntity;
        if (!staticComp) {
            return;
        }

        // this.recomputePaths = true;
        /*
        const metaBelt = gMetaBuildingRegistry.findByClass(MetaBeltBaseBuilding);

        // Compute affected area
        const originalRect = staticComp.getTileSpaceBounds();
        const affectedArea = originalRect.expandedInAllDirections(1);

        // Store if anything got changed, if so we need to queue a recompute
        let anythingChanged = false;

        anythingChanged = true; // TODO / FIXME

        for (let x = affectedArea.x; x < affectedArea.right(); ++x) {
            for (let y = affectedArea.y; y < affectedArea.bottom(); ++y) {
                if (!originalRect.containsPoint(x, y)) {
                    const targetEntity = this.root.map.getTileContentXY(x, y);
                    if (targetEntity) {
                        const targetBeltComp = targetEntity.components.Belt;
                        if (targetBeltComp) {
                            const targetStaticComp = targetEntity.components.StaticMapEntity;
                            const {
                                rotation,
                                rotationVariant,
                            } = metaBelt.computeOptimalDirectionAndRotationVariantAtTile(
                                this.root,
                                new Vector(x, y),
                                targetStaticComp.originalRotation,
                                defaultBuildingVariant
                            );
                            targetStaticComp.rotation = rotation;
                            metaBelt.updateVariants(targetEntity, rotationVariant, defaultBuildingVariant);
                            anythingChanged = true;
                        }
                    }
                }
            }
        }

        if (anythingChanged) {
            if (this.areaToRecompute) {
                this.areaToRecompute = this.areaToRecompute.getUnion(affectedArea);
            } else {
                this.areaToRecompute = affectedArea.clone();
            }
            if (G_IS_DEV) {
                logger.log("Queuing recompute:", this.areaToRecompute);
            }
        }

        // FIXME
        this.areaToRecompute = new Rectangle(-1000, -1000, 2000, 2000);
        */
    }

    /**
     * Called when an entity got destroyed
     * @param {Entity} entity
     */
    onEntityDestroyed(entity) {
        if (!this.root.gameInitialized) {
            return;
        }

        if (!entity.components.Belt) {
            return;
        }

        const assignedPath = entity.components.Belt.assignedPath;
        assert(assignedPath, "Entity has no belt path assigned");
        this.deleteEntityFromPath(assignedPath, entity);
        this.verifyBeltPaths();
    }

    /**
     * Attempts to delete the belt from its current path
     * @param {BeltPath} path
     * @param {Entity} entity
     */
    deleteEntityFromPath(path, entity) {
        if (path.entityPath.length === 1) {
            // This is a single entity path, easy to do, simply erase whole path
            fastArrayDeleteValue(this.beltPaths, path);
            return;
        }

        // Notice: Since there might be circular references, it is important to check
        // which role the entity has
        if (path.isStartEntity(entity)) {
            // We tried to delete the start
            path.deleteEntityOnStart(entity);
        } else if (path.isEndEntity(entity)) {
            // We tried to delete the end
            path.deleteEntityOnEnd(entity);
        } else {
            // We tried to delete something inbetween
            const newPath = path.deleteEntityOnPathSplitIntoTwo(entity);
            this.beltPaths.push(newPath);
        }
    }

    /**
     * Called when an entity got added
     * @param {Entity} entity
     */
    onEntityAdded(entity) {
        if (!this.root.gameInitialized) {
            return;
        }

        if (!entity.components.Belt) {
            return;
        }

        const fromEntity = this.findSupplyingEntity(entity);
        const toEntity = this.findFollowUpEntity(entity);

        // Check if we can add the entity to the previous path
        if (fromEntity) {
            const fromPath = fromEntity.components.Belt.assignedPath;
            fromPath.extendOnEnd(entity);

            // Check if we now can extend the current path by the next path
            if (toEntity) {
                const toPath = toEntity.components.Belt.assignedPath;

                if (fromPath === toPath) {
                    // This is a circular dependency -> Ignore
                } else {
                    fromPath.extendByPath(toPath);

                    // Delete now obsolete path
                    fastArrayDeleteValue(this.beltPaths, toPath);
                }
            }
        } else {
            if (toEntity) {
                // Prepend it to the other path
                const toPath = toEntity.components.Belt.assignedPath;
                toPath.extendOnBeginning(entity);
            } else {
                // This is an empty belt path
                const path = new BeltPath(this.root, [entity]);
                this.beltPaths.push(path);
            }
        }

        this.verifyBeltPaths();
    }

    draw(parameters) {
        for (let i = 0; i < this.beltPaths.length; ++i) {
            this.beltPaths[i].draw(parameters);
        }
    }

    /**
     * Verifies all belt paths
     */
    verifyBeltPaths() {
        if (G_IS_DEV) {
            for (let i = 0; i < this.beltPaths.length; ++i) {
                this.beltPaths[i].debug_checkIntegrity("general-verify");
            }

            const belts = this.root.entityMgr.getAllWithComponent(BeltComponent);
            for (let i = 0; i < belts.length; ++i) {
                const path = belts[i].components.Belt.assignedPath;
                if (!path) {
                    throw new Error("Belt has no path: " + belts[i].uid);
                }
                if (this.beltPaths.indexOf(path) < 0) {
                    throw new Error("Path of entity not contained: " + belts[i].uid);
                }
            }
        }
    }

    /**
     * Finds the follow up entity for a given belt. Used for building the dependencies
     * @param {Entity} entity
     */
    findFollowUpEntity(entity) {
        const staticComp = entity.components.StaticMapEntity;
        const beltComp = entity.components.Belt;

        const followUpDirection = staticComp.localDirectionToWorld(beltComp.direction);
        const followUpVector = enumDirectionToVector[followUpDirection];

        const followUpTile = staticComp.origin.add(followUpVector);
        const followUpEntity = this.root.map.getTileContent(followUpTile);

        // Check if theres a belt at the tile we point to
        if (followUpEntity) {
            const followUpBeltComp = followUpEntity.components.Belt;
            if (followUpBeltComp) {
                const followUpStatic = followUpEntity.components.StaticMapEntity;
                const followUpAcceptor = followUpEntity.components.ItemAcceptor;

                // Check if the belt accepts items from our direction
                const acceptorSlots = followUpAcceptor.slots;
                for (let i = 0; i < acceptorSlots.length; ++i) {
                    const slot = acceptorSlots[i];
                    for (let k = 0; k < slot.directions.length; ++k) {
                        const localDirection = followUpStatic.localDirectionToWorld(slot.directions[k]);
                        if (enumInvertedDirections[localDirection] === followUpDirection) {
                            return followUpEntity;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Finds the supplying belt for a given belt. Used for building the dependencies
     * @param {Entity} entity
     */
    findSupplyingEntity(entity) {
        const staticComp = entity.components.StaticMapEntity;

        const supplyDirection = staticComp.localDirectionToWorld(enumDirection.bottom);
        const supplyVector = enumDirectionToVector[supplyDirection];

        const supplyTile = staticComp.origin.add(supplyVector);
        const supplyEntity = this.root.map.getTileContent(supplyTile);

        // Check if theres a belt at the tile we point to
        if (supplyEntity) {
            const supplyBeltComp = supplyEntity.components.Belt;
            if (supplyBeltComp) {
                const supplyStatic = supplyEntity.components.StaticMapEntity;
                const supplyEjector = supplyEntity.components.ItemEjector;

                // Check if the belt accepts items from our direction
                const ejectorSlots = supplyEjector.slots;
                for (let i = 0; i < ejectorSlots.length; ++i) {
                    const slot = ejectorSlots[i];
                    const localDirection = supplyStatic.localDirectionToWorld(slot.direction);
                    if (enumInvertedDirections[localDirection] === supplyDirection) {
                        return supplyEntity;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Recomputes the belt cache
     */
    computeBeltCache() {
        this.recomputePaths = false;
        /*
        if (this.areaToRecompute) {
            logger.log("Updating belt cache by updating area:", this.areaToRecompute);

            if (G_IS_DEV && globalConfig.debug.renderChanges) {
                this.root.hud.parts.changesDebugger.renderChange(
                    "belt-area",
                    this.areaToRecompute,
                    "#00fff6"
                );
            }

            for (let x = this.areaToRecompute.x; x < this.areaToRecompute.right(); ++x) {
                for (let y = this.areaToRecompute.y; y < this.areaToRecompute.bottom(); ++y) {
                    const tile = this.root.map.getTileContentXY(x, y);
                    if (tile && tile.components.Belt) {
                        tile.components.Belt.followUpCache = this.findFollowUpEntity(tile);
                    }
                }
            }

            // Reset stale areas afterwards
            this.areaToRecompute = null;
        } else {
            logger.log("Doing full belt recompute");

            if (G_IS_DEV && globalConfig.debug.renderChanges) {
                this.root.hud.parts.changesDebugger.renderChange(
                    "",
                    new Rectangle(-1000, -1000, 2000, 2000),
                    "#00fff6"
                );
            }

            for (let i = 0; i < this.allEntities.length; ++i) {
                const entity = this.allEntities[i];
                entity.components.Belt.followUpCache = this.findFollowUpEntity(entity);
            }
        }
        */
        this.computeBeltPaths();
    }

    /**
     * Computes the belt path network
     */
    computeBeltPaths() {
        const visitedUids = new Set();

        const result = [];

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            if (visitedUids.has(entity.uid)) {
                continue;
            }

            // Mark entity as visited
            visitedUids.add(entity.uid);

            // Compute path, start with entity and find precedors / successors
            const path = [entity];

            let maxIter = 9999;

            // Find precedors
            let prevEntity = this.findSupplyingEntity(entity);
            while (prevEntity && --maxIter > 0) {
                if (visitedUids.has(prevEntity.uid)) {
                    break;
                }
                path.unshift(prevEntity);
                visitedUids.add(prevEntity.uid);
                prevEntity = this.findSupplyingEntity(prevEntity);
            }

            // Find succedors
            let nextEntity = this.findFollowUpEntity(entity);
            while (nextEntity && --maxIter > 0) {
                if (visitedUids.has(nextEntity.uid)) {
                    break;
                }

                path.push(nextEntity);
                visitedUids.add(nextEntity.uid);
                nextEntity = this.findFollowUpEntity(nextEntity);
            }

            assert(maxIter > 1, "Ran out of iterations");
            result.push(new BeltPath(this.root, path));
        }

        logger.log("Found", this.beltPaths.length, "belt paths");
        this.beltPaths = result;
    }

    update() {
        if (this.recomputePaths) {
            this.computeBeltCache();
        }

        this.verifyBeltPaths();

        for (let i = 0; i < this.beltPaths.length; ++i) {
            this.beltPaths[i].update();
        }

        this.verifyBeltPaths();

        return;
        /*

        // Divide by item spacing on belts since we use throughput and not speed
        let beltSpeed =
            this.root.hubGoals.getBeltBaseSpeed() *
            this.root.dynamicTickrate.deltaSeconds *
            globalConfig.itemSpacingOnBelts;

        if (G_IS_DEV && globalConfig.debug.instantBelts) {
            beltSpeed *= 100;
        }

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const beltComp = entity.components.Belt;
            const items = beltComp.sortedItems;

            if (items.length === 0) {
                // Fast out for performance
                continue;
            }

            const ejectorComp = entity.components.ItemEjector;
            let maxProgress = 1;

            // PERFORMANCE OPTIMIZATION
            // Original:
            //   const isCurrentlyEjecting = ejectorComp.isAnySlotEjecting();
            // Replaced (Since belts always have just one slot):
            const ejectorSlot = ejectorComp.slots[0];
            const isCurrentlyEjecting = ejectorSlot.item;

            // When ejecting, we can not go further than the item spacing since it
            // will be on the corner
            if (isCurrentlyEjecting) {
                maxProgress = 1 - globalConfig.itemSpacingOnBelts;
            } else {
                // Otherwise our progress depends on the follow up
                if (beltComp.followUpCache) {
                    const spacingOnBelt = beltComp.followUpCache.components.Belt.getDistanceToFirstItemCenter();
                    maxProgress = Math.min(2, 1 - globalConfig.itemSpacingOnBelts + spacingOnBelt);

                    // Useful check, but hurts performance
                    // assert(maxProgress >= 0.0, "max progress < 0 (I) (" + maxProgress + ")");
                }
            }

            let speedMultiplier = 1;
            if (beltComp.direction !== enumDirection.top) {
                // Curved belts are shorter, thus being quicker (Looks weird otherwise)
                speedMultiplier = SQRT_2;
            }

            // How much offset we add when transferring to a new belt
            // This substracts one tick because the belt will be updated directly
            // afterwards anyways
            const takeoverOffset = 1.0 + beltSpeed * speedMultiplier;

            // Not really nice. haven't found the reason for this yet.
            if (items.length > 2 / globalConfig.itemSpacingOnBelts) {
                beltComp.sortedItems = [];
            }

            for (let itemIndex = items.length - 1; itemIndex >= 0; --itemIndex) {
                const progressAndItem = items[itemIndex];

                progressAndItem[0] = Math.min(maxProgress, progressAndItem[0] + speedMultiplier * beltSpeed);
                assert(progressAndItem[0] >= 0, "Bad progress: " + progressAndItem[0]);

                if (progressAndItem[0] >= 1.0) {
                    if (beltComp.followUpCache) {
                        const followUpBelt = beltComp.followUpCache.components.Belt;
                        if (followUpBelt.canAcceptItem()) {
                            followUpBelt.takeItem(
                                progressAndItem[1],
                                Math_max(0, progressAndItem[0] - takeoverOffset)
                            );
                            items.splice(itemIndex, 1);
                        } else {
                            // Well, we couldn't really take it to a follow up belt, keep it at
                            // max progress
                            progressAndItem[0] = 1.0;
                            maxProgress = 1 - globalConfig.itemSpacingOnBelts;
                        }
                    } else {
                        // Try to give this item to a new belt

                        // PERFORMANCE OPTIMIZATION

                        // Original:
                        //  const freeSlot = ejectorComp.getFirstFreeSlot();

                        // Replaced
                        if (ejectorSlot.item) {
                            // So, we don't have a free slot - damned!
                            progressAndItem[0] = 1.0;
                            maxProgress = 1 - globalConfig.itemSpacingOnBelts;
                        } else {
                            // We got a free slot, remove this item and keep it on the ejector slot
                            if (!ejectorComp.tryEject(0, progressAndItem[1])) {
                                assert(false, "Ejection failed");
                            }
                            items.splice(itemIndex, 1);

                            // NOTICE: Do not override max progress here at all, this leads to issues
                        }
                    }
                } else {
                    // We just moved this item forward, so determine the maximum progress of other items
                    maxProgress = Math.max(0, progressAndItem[0] - globalConfig.itemSpacingOnBelts);
                }
            }
        }
        */
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        if (parameters.zoomLevel < globalConfig.mapChunkOverviewMinZoom) {
            return;
        }

        const speedMultiplier = this.root.hubGoals.getBeltBaseSpeed();

        // SYNC with systems/item_acceptor.js:drawEntityUnderlays!
        // 126 / 42 is the exact animation speed of the png animation
        const animationIndex = Math.floor(
            ((this.root.time.now() * speedMultiplier * BELT_ANIM_COUNT * 126) / 42) *
                globalConfig.itemSpacingOnBelts
        );
        const contents = chunk.contents;
        for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
            for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                const entity = contents[x][y];

                if (entity && entity.components.Belt) {
                    const direction = entity.components.Belt.direction;
                    const sprite = this.beltAnimations[direction][animationIndex % BELT_ANIM_COUNT];

                    entity.components.StaticMapEntity.drawSpriteOnFullEntityBounds(
                        parameters,
                        sprite,
                        0,
                        false
                    );
                }
            }
        }
        1;
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityItems(parameters, entity) {
        /*
        const beltComp = entity.components.Belt;
        const staticComp = entity.components.StaticMapEntity;

        const items = beltComp.sortedItems;

        if (items.length === 0) {
            // Fast out for performance
            return;
        }

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        for (let i = 0; i < items.length; ++i) {
            const itemAndProgress = items[i];

            // Nice would be const [pos, item] = itemAndPos;  but that gets polyfilled and is super slow then
            const progress = itemAndProgress[0];
            const item = itemAndProgress[1];

            const position = staticComp.applyRotationToVector(beltComp.transformBeltToLocalSpace(progress));

            item.draw(
                (staticComp.origin.x + position.x + 0.5) * globalConfig.tileSize,
                (staticComp.origin.y + position.y + 0.5) * globalConfig.tileSize,
                parameters
            );
        }
        */
    }

    /**
     * Draws the belt parameters
     * @param {DrawParameters} parameters
     */
    drawBeltPathDebug(parameters) {
        for (let i = 0; i < this.beltPaths.length; ++i) {
            this.beltPaths[i].drawDebug(parameters);
        }
    }
}
