import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { enumDirectionToVector, Vector } from "../../core/vector";
import { BaseItem } from "../base_item";
import { ItemEjectorComponent } from "../components/item_ejector";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { Math_min } from "../../core/builtins";
import { createLogger } from "../../core/logging";

const logger = createLogger("systems/ejector");

export class ItemEjectorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemEjectorComponent]);

        /**
         * @type {Array<{
         *  targetEntity: Entity,
         *  sourceSlot: import("../components/item_ejector").ItemEjectorSlot,
         *  destSlot: import("../components/item_acceptor").ItemAcceptorLocatedSlot
         * }>}
         */
        this.cache = [];

        this.cacheNeedsUpdate = true;

        this.root.signals.entityAdded.add(this.invalidateCache, this);
        this.root.signals.entityDestroyed.add(this.invalidateCache, this);
    }

    invalidateCache() {
        this.cacheNeedsUpdate = true;
    }

    /**
     * Precomputes the cache, which makes up for a huge performance improvement
     */
    recomputeCache() {
        logger.log("Recomputing cache");

        const cache = [];

        // Try to find acceptors for every ejector
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const ejectorComp = entity.components.ItemEjector;
            const staticComp = entity.components.StaticMapEntity;

            // For every ejector slot, try to find an acceptor
            for (let ejectorSlotIndex = 0; ejectorSlotIndex < ejectorComp.slots.length; ++ejectorSlotIndex) {
                const ejectorSlot = ejectorComp.slots[ejectorSlotIndex];

                // Figure out where and into which direction we eject items
                const ejectSlotWsTile = staticComp.localTileToWorld(ejectorSlot.pos);
                const ejectSlotWsDirection = staticComp.localDirectionToWorld(ejectorSlot.direction);
                const ejectSlotWsDirectionVector = enumDirectionToVector[ejectSlotWsDirection];
                const ejectSlotTargetWsTile = ejectSlotWsTile.add(ejectSlotWsDirectionVector);

                // Try to find the given acceptor component to take the item
                const targetEntity = this.root.map.getTileContent(ejectSlotTargetWsTile);
                if (!targetEntity) {
                    // No consumer for item
                    continue;
                }

                const targetAcceptorComp = targetEntity.components.ItemAcceptor;
                const targetStaticComp = targetEntity.components.StaticMapEntity;
                if (!targetAcceptorComp) {
                    // Entity doesn't accept items
                    continue;
                }

                const matchingSlot = targetAcceptorComp.findMatchingSlot(
                    targetStaticComp.worldToLocalTile(ejectSlotTargetWsTile),
                    targetStaticComp.worldDirectionToLocal(ejectSlotWsDirection)
                );

                if (!matchingSlot) {
                    // No matching slot found
                    continue;
                }

                // Ok we found a connection
                cache.push({
                    targetEntity,
                    sourceSlot: ejectorSlot,
                    destSlot: matchingSlot,
                });
            }
        }

        this.cache = cache;
        logger.log("Found", cache.length, "entries to update");
    }

    update() {
        if (this.cacheNeedsUpdate) {
            this.cacheNeedsUpdate = false;
            this.recomputeCache();
        }

        // Precompute effective belt speed
        const effectiveBeltSpeed = this.root.hubGoals.getBeltBaseSpeed() * globalConfig.itemSpacingOnBelts;
        let progressGrowth = (effectiveBeltSpeed / 0.5) * this.root.dynamicTickrate.deltaSeconds;

        if (G_IS_DEV && globalConfig.debug.instantBelts) {
            progressGrowth = 1;
        }

        // Go over all cache entries
        for (let i = 0; i < this.cache.length; ++i) {
            const { sourceSlot, destSlot, targetEntity } = this.cache[i];
            const item = sourceSlot.item;

            if (!item) {
                // No item available to be ejected
                continue;
            }

            // Advance items on the slot
            sourceSlot.progress = Math_min(1, sourceSlot.progress + progressGrowth);

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

        const beltComp = receiver.components.Belt;
        if (beltComp) {
            // Ayy, its a belt!
            if (beltComp.canAcceptItem()) {
                beltComp.takeItem(item);
                return true;
            }
        }

        const storageComp = receiver.components.Storage;
        if (storageComp) {
            // It's a storage
            if (storageComp.canAcceptItem(item)) {
                storageComp.takeItem(item);
                return true;
            }
        }

        const itemProcessorComp = receiver.components.ItemProcessor;
        if (itemProcessorComp) {
            // Its an item processor ..
            if (itemProcessorComp.tryTakeItem(item, slotIndex)) {
                return true;
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
        }

        return false;
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawSingleEntity.bind(this));
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawSingleEntity(parameters, entity) {
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
