import { Math_radians, Math_min, Math_max, Math_sqrt } from "../../core/builtins";
import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { AtlasSprite } from "../../core/sprites";
import { BeltComponent } from "../components/belt";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { enumDirection, enumDirectionToVector, Vector, enumInvertedDirections } from "../../core/vector";
import { MapChunkView } from "../map_chunk_view";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { MetaBeltBaseBuilding } from "../buildings/belt_base";
import { defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { createLogger } from "../../core/logging";

const BELT_ANIM_COUNT = 6;
const SQRT_2 = Math_sqrt(2);

const logger = createLogger("belt");

/** @typedef {Array<{ entity: Entity, followUp: Entity }>} BeltCache */

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
        /**b
         * @type {Object.<enumDirection, Array<AtlasSprite>>}
         */
        this.beltAnimations = {
            [enumDirection.top]: [
                Loader.getSprite("sprites/belt/forward_0.png"),
                Loader.getSprite("sprites/belt/forward_1.png"),
                Loader.getSprite("sprites/belt/forward_2.png"),
                Loader.getSprite("sprites/belt/forward_3.png"),
                Loader.getSprite("sprites/belt/forward_4.png"),
                Loader.getSprite("sprites/belt/forward_5.png"),
            ],
            [enumDirection.left]: [
                Loader.getSprite("sprites/belt/left_0.png"),
                Loader.getSprite("sprites/belt/left_1.png"),
                Loader.getSprite("sprites/belt/left_2.png"),
                Loader.getSprite("sprites/belt/left_3.png"),
                Loader.getSprite("sprites/belt/left_4.png"),
                Loader.getSprite("sprites/belt/left_5.png"),
            ],
            [enumDirection.right]: [
                Loader.getSprite("sprites/belt/right_0.png"),
                Loader.getSprite("sprites/belt/right_1.png"),
                Loader.getSprite("sprites/belt/right_2.png"),
                Loader.getSprite("sprites/belt/right_3.png"),
                Loader.getSprite("sprites/belt/right_4.png"),
                Loader.getSprite("sprites/belt/right_5.png"),
            ],
        };

        this.root.signals.entityAdded.add(this.updateSurroundingBeltPlacement, this);
        this.root.signals.entityDestroyed.add(this.updateSurroundingBeltPlacement, this);

        this.cacheNeedsUpdate = true;

        /** @type {BeltCache} */
        this.beltCache = [];
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

        if (entity.components.Belt) {
            this.cacheNeedsUpdate = true;
        }

        const metaBelt = gMetaBuildingRegistry.findByClass(MetaBeltBaseBuilding);

        // Compute affected area
        const originalRect = staticComp.getTileSpaceBounds();
        const affectedArea = originalRect.expandedInAllDirections(1);
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
                            this.cacheNeedsUpdate = true;
                        }
                    }
                }
            }
        }
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityItems.bind(this));
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
     * Adds a single entity to the cache
     * @param {Entity} entity
     * @param {BeltCache} cache
     * @param {Set} visited
     */
    computeSingleBeltCache(entity, cache, visited) {
        // Check for double visit
        if (visited.has(entity.uid)) {
            return;
        }
        visited.add(entity.uid);

        const followUp = this.findFollowUpEntity(entity);
        if (followUp) {
            // Process followup first
            this.computeSingleBeltCache(followUp, cache, visited);
        }

        cache.push({ entity, followUp });
    }

    computeBeltCache() {
        logger.log("Updating belt cache");

        let cache = [];
        let visited = new Set();
        for (let i = 0; i < this.allEntities.length; ++i) {
            this.computeSingleBeltCache(this.allEntities[i], cache, visited);
        }
        assert(
            cache.length === this.allEntities.length,
            "Belt cache mismatch: Has " + cache.length + " entries but should have " + this.allEntities.length
        );

        this.beltCache = cache;
    }

    update() {
        if (this.cacheNeedsUpdate) {
            this.cacheNeedsUpdate = false;
            this.computeBeltCache();
        }

        // Divide by item spacing on belts since we use throughput and not speed
        let beltSpeed =
            this.root.hubGoals.getBeltBaseSpeed() *
            this.root.dynamicTickrate.deltaSeconds *
            globalConfig.itemSpacingOnBelts;

        if (G_IS_DEV && globalConfig.debug.instantBelts) {
            beltSpeed *= 100;
        }

        for (let i = 0; i < this.beltCache.length; ++i) {
            const { entity, followUp } = this.beltCache[i];

            const beltComp = entity.components.Belt;
            const items = beltComp.sortedItems;

            if (items.length === 0) {
                // Fast out for performance
                continue;
            }

            const ejectorComp = entity.components.ItemEjector;
            let maxProgress = 1;

            /* PERFORMANCE OPTIMIZATION */
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
                if (followUp) {
                    const spacingOnBelt = followUp.components.Belt.getDistanceToFirstItemCenter();
                    maxProgress = Math.min(2, 1 - globalConfig.itemSpacingOnBelts + spacingOnBelt);

                    // Useful check, but hurts performance
                    // assert(maxProgress >= 0.0, "max progress < 0 (I)");
                }
            }

            let speedMultiplier = 1;
            if (beltComp.direction !== enumDirection.top) {
                // Curved belts are shorter, thus being quicker (Looks weird otherwise)
                speedMultiplier = SQRT_2;
            }

            // Not really nice. haven't found the reason for this yet.
            if (items.length > 2 / globalConfig.itemSpacingOnBelts) {
                beltComp.sortedItems = [];
            }

            for (let itemIndex = items.length - 1; itemIndex >= 0; --itemIndex) {
                const progressAndItem = items[itemIndex];

                progressAndItem[0] = Math.min(maxProgress, progressAndItem[0] + speedMultiplier * beltSpeed);

                if (progressAndItem[0] >= 1.0) {
                    if (followUp) {
                        const followUpBelt = followUp.components.Belt;
                        if (followUpBelt.canAcceptItem()) {
                            followUpBelt.takeItem(progressAndItem[1], progressAndItem[0] - 1.0);
                            items.splice(itemIndex, 1);
                        } else {
                            // Well, we couldn't really take it to a follow up belt, keep it at
                            // max progress
                            progressAndItem[0] = 1.0;
                            maxProgress = 1 - globalConfig.itemSpacingOnBelts;
                        }
                    } else {
                        // Try to give this item to a new belt

                        /* PERFORMANCE OPTIMIZATION */
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
    }
}
