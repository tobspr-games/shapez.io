import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { createLogger } from "../../core/logging";
import { Rectangle } from "../../core/rectangle";
import { enumDirectionToVector, Vector } from "../../core/vector";
import { BaseItem, enumItemType, enumItemTypeToLayer } from "../base_item";
import { ItemEjectorComponent } from "../components/item_ejector";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { enumLayer } from "../root";

const logger = createLogger("systems/ejector");

export class ItemEjectorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemEjectorComponent]);

        this.root.signals.entityAdded.add(this.checkForCacheInvalidation, this);
        this.root.signals.entityDestroyed.add(this.checkForCacheInvalidation, this);
        this.root.signals.postLoadHook.add(this.recomputeCache, this);

        /**
         * @type {Rectangle}
         */
        this.areaToRecompute = null;
    }

    /**
     *
     * @param {Entity} entity
     */
    checkForCacheInvalidation(entity) {
        if (!this.root.gameInitialized) {
            return;
        }
        if (!entity.components.StaticMapEntity) {
            return;
        }

        // Optimize for the common case: adding or removing one building at a time. Clicking
        // and dragging can cause up to 4 add/remove signals.
        const staticComp = entity.components.StaticMapEntity;
        const bounds = staticComp.getTileSpaceBounds();
        const expandedBounds = bounds.expandedInAllDirections(2);

        if (this.areaToRecompute) {
            this.areaToRecompute = this.areaToRecompute.getUnion(expandedBounds);
        } else {
            this.areaToRecompute = expandedBounds;
        }
    }

    /**
     * Precomputes the cache, which makes up for a huge performance improvement
     */
    recomputeCache() {
        if (this.areaToRecompute) {
            logger.log("Recomputing cache using rectangle");
            if (G_IS_DEV && globalConfig.debug.renderChanges) {
                this.root.hud.parts.changesDebugger.renderChange(
                    "ejector-area",
                    this.areaToRecompute,
                    "#fe50a6"
                );
            }
            this.recomputeAreaCache();
            this.areaToRecompute = null;
        } else {
            logger.log("Full cache recompute");
            if (G_IS_DEV && globalConfig.debug.renderChanges) {
                this.root.hud.parts.changesDebugger.renderChange(
                    "ejector-full",
                    new Rectangle(-1000, -1000, 2000, 2000),
                    "#fe50a6"
                );
            }

            // Try to find acceptors for every ejector
            for (let i = 0; i < this.allEntities.length; ++i) {
                const entity = this.allEntities[i];
                this.recomputeSingleEntityCache(entity);
            }
        }
    }

    /**
     * Recomputes the cache in the given area
     */
    recomputeAreaCache() {
        const area = this.areaToRecompute;
        let entryCount = 0;

        logger.log("Recomputing area:", area.x, area.y, "/", area.w, area.h);

        // Store the entities we already recomputed, so we don't do work twice
        const recomputedEntities = new Set();

        for (let x = area.x; x < area.right(); ++x) {
            for (let y = area.y; y < area.bottom(); ++y) {
                const entities = this.root.map.getLayersContentsMultipleXY(x, y);
                for (let i = 0; i < entities.length; ++i) {
                    const entity = entities[i];

                    // Recompute the entity in case its relevant for this system and it
                    // hasn't already been computed
                    if (!recomputedEntities.has(entity.uid) && entity.components.ItemEjector) {
                        recomputedEntities.add(entity.uid);
                        this.recomputeSingleEntityCache(entity);
                    }
                }
            }
        }
        return entryCount;
    }

    /**
     * @param {Entity} entity
     */
    recomputeSingleEntityCache(entity) {
        const ejectorComp = entity.components.ItemEjector;
        const staticComp = entity.components.StaticMapEntity;

        // Clear the old cache.
        ejectorComp.cachedConnectedSlots = null;

        for (let ejectorSlotIndex = 0; ejectorSlotIndex < ejectorComp.slots.length; ++ejectorSlotIndex) {
            const ejectorSlot = ejectorComp.slots[ejectorSlotIndex];

            // Clear the old cache.
            ejectorSlot.cachedDestSlot = null;
            ejectorSlot.cachedTargetEntity = null;

            // Figure out where and into which direction we eject items
            const ejectSlotWsTile = staticComp.localTileToWorld(ejectorSlot.pos);
            const ejectSlotWsDirection = staticComp.localDirectionToWorld(ejectorSlot.direction);
            const ejectSlotWsDirectionVector = enumDirectionToVector[ejectSlotWsDirection];
            const ejectSlotTargetWsTile = ejectSlotWsTile.add(ejectSlotWsDirectionVector);

            // Try to find the given acceptor component to take the item
            // Since there can be cross layer dependencies, check on all layers
            const targetEntities = this.root.map.getLayersContentsMultipleXY(
                ejectSlotTargetWsTile.x,
                ejectSlotTargetWsTile.y
            );

            for (let i = 0; i < targetEntities.length; ++i) {
                const targetEntity = targetEntities[i];

                const targetAcceptorComp = targetEntity.components.ItemAcceptor;
                const targetStaticComp = targetEntity.components.StaticMapEntity;
                if (!targetAcceptorComp) {
                    // Entity doesn't accept items
                    continue;
                }

                const matchingSlot = targetAcceptorComp.findMatchingSlot(
                    targetStaticComp.worldToLocalTile(ejectSlotTargetWsTile),
                    targetStaticComp.worldDirectionToLocal(ejectSlotWsDirection),
                    ejectorSlot.layer
                );

                if (!matchingSlot) {
                    // No matching slot found
                    continue;
                }

                // Ok we found a connection
                if (ejectorComp.cachedConnectedSlots) {
                    ejectorComp.cachedConnectedSlots.push(ejectorSlot);
                } else {
                    ejectorComp.cachedConnectedSlots = [ejectorSlot];
                }

                // A slot can always be connected to one other slot only
                ejectorSlot.cachedTargetEntity = targetEntity;
                ejectorSlot.cachedDestSlot = matchingSlot;
                break;
            }
        }
    }

    update() {
        if (this.areaToRecompute) {
            this.recomputeCache();
        }

        // Precompute effective belt speed
        let progressGrowth = 2 * this.root.dynamicTickrate.deltaSeconds;

        if (G_IS_DEV && globalConfig.debug.instantBelts) {
            progressGrowth = 1;
        }

        // Go over all cache entries
        for (let i = 0; i < this.allEntities.length; ++i) {
            const sourceEntity = this.allEntities[i];
            const sourceEjectorComp = sourceEntity.components.ItemEjector;
            if (!sourceEjectorComp.enabled) {
                continue;
            }

            if (!sourceEjectorComp.cachedConnectedSlots) {
                continue;
            }

            const slots = sourceEjectorComp.cachedConnectedSlots;
            for (let j = 0; j < slots.length; ++j) {
                const sourceSlot = slots[j];
                const item = sourceSlot.item;
                if (!item) {
                    // No item available to be ejected
                    continue;
                }

                const destSlot = sourceSlot.cachedDestSlot;
                const targetEntity = sourceSlot.cachedTargetEntity;

                // Advance items on the slot
                sourceSlot.progress = Math.min(
                    1,
                    sourceSlot.progress +
                    progressGrowth *
                    this.root.hubGoals.getBeltBaseSpeed(sourceSlot.layer) *
                    globalConfig.beltItemSpacingByLayer[sourceSlot.layer]
                );

                // Check if we are still in the process of ejecting, can't proceed then
                if (sourceSlot.progress < 1.0) {
                    continue;
                }

                // Check if the target acceptor can actually accept this item
                const targetAcceptorComp = targetEntity.components.ItemAcceptor;
                if (!targetAcceptorComp.canAcceptItem(destSlot.index, item)) {
                    continue;
                }

                // Try to hand over the item
                if (this.tryPassOverItem(item, targetEntity, destSlot.index)) {
                    // Handover successful, clear slot
                    targetAcceptorComp.onItemAccepted(destSlot.index, destSlot.acceptedDirection, item);
                    sourceSlot.item = null;
                    continue;
                }
            }
        }
    }

    /**
     *
     * @param {BaseItem} item
     * @param {Entity} receiver
     * @param {number} slotIndex
     */
    tryPassOverItem(item, receiver, slotIndex) {
        // Try figuring out how what to do with the item
        // TODO: Kinda hacky. How to solve this properly? Don't want to go through inheritance hell.
        // Also its just a few cases (hope it stays like this .. :x).

        const itemLayer = enumItemTypeToLayer[item.getItemType()];

        const beltComp = receiver.components.Belt;
        if (beltComp) {
            const path = beltComp.assignedPath;
            assert(path, "belt has no path");
            if (path.tryAcceptItem(item)) {
                return true;
            }
            // Belt can have nothing else
            return false;
        }

        const energyConsumerComp = receiver.components.EnergyConsumer;
        if (energyConsumerComp) {
            if (energyConsumerComp.tryAcceptItem(item, slotIndex)) {
                // All good
                return true;
            }

            // Energy consumer can have more components
        }

        const itemProcessorComp = receiver.components.ItemProcessor;
        if (itemProcessorComp) {
            // Make sure its the same layer
            if (itemLayer === receiver.layer) {
                // Its an item processor ..
                if (itemProcessorComp.tryTakeItem(item, slotIndex)) {
                    return true;
                }
                // Item processor can have nothing else
                return false;
            }
        }

        const undergroundBeltComp = receiver.components.UndergroundBelt;
        if (undergroundBeltComp) {
            // Its an underground belt. yay.
            if (
                undergroundBeltComp.tryAcceptExternalItem(
                    item,
                    this.root.hubGoals.getUndergroundBeltBaseSpeed()
                )
            ) {
                return true;
            }

            // Underground belt can have nothing else
            return false;
        }

        const storageComp = receiver.components.Storage;
        if (storageComp) {
            // It's a storage
            if (storageComp.canAcceptItem(item)) {
                storageComp.takeItem(item);
                return true;
            }

            // Storage can't have anything else
            return false;
        }

        const energyGeneratorComp = receiver.components.EnergyGenerator;
        if (energyGeneratorComp) {
            if (energyGeneratorComp.tryTakeItem(item, slotIndex)) {
                // Passed it over
                return true;
            }

            // Energy generator comp can't have anything else
            return false;
        }

        const counterComp = receiver.components.Counter;
        if (counterComp) {
            if (counterComp.tryTakeItem(item, slotIndex)) {
                // Passed it over
                return true;
            }

            return false;
        }

        return false;
    }

    /**
     * Draws the given layer
     * @param {DrawParameters} parameters
     * @param {enumLayer} layer
     */
    drawLayer(parameters, layer) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawSingleEntity.bind(this, layer));
    }

    /**
     * @param {enumLayer} layer
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawSingleEntity(layer, parameters, entity) {
        const ejectorComp = entity.components.ItemEjector;
        const staticComp = entity.components.StaticMapEntity;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        for (let i = 0; i < ejectorComp.slots.length; ++i) {
            const slot = ejectorComp.slots[i];
            const ejectedItem = slot.item;

            if (!ejectedItem) {
                // No item
                continue;
            }

            if (slot.layer !== layer) {
                // Not our layer
                continue;
            }

            const realPosition = slot.pos.rotateFastMultipleOf90(staticComp.rotation);
            const realDirection = Vector.transformDirectionFromMultipleOf90(
                slot.direction,
                staticComp.rotation
            );
            const realDirectionVector = enumDirectionToVector[realDirection];

            const tileX =
                staticComp.origin.x + realPosition.x + 0.5 + realDirectionVector.x * 0.5 * slot.progress;
            const tileY =
                staticComp.origin.y + realPosition.y + 0.5 + realDirectionVector.y * 0.5 * slot.progress;

            const worldX = tileX * globalConfig.tileSize;
            const worldY = tileY * globalConfig.tileSize;

            ejectedItem.draw(worldX, worldY, parameters);
        }
    }
}
