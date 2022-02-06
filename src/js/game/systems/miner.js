import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { enumDirectionToVector } from "../../core/vector";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";

export class MinerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [MinerComponent]);

        this.needsRecompute = true;

        this.root.signals.entityAdded.add(this.onEntityChanged, this);
        this.root.signals.entityChanged.add(this.onEntityChanged, this);
        this.root.signals.entityDestroyed.add(this.onEntityChanged, this);
    }

    /**
     * Called whenever an entity got changed
     * @param {Entity} entity
     */
    onEntityChanged(entity) {
        const minerComp = entity.components.Miner;
        if (minerComp && minerComp.chainable) {
            // Miner component, need to recompute
            this.needsRecompute = true;
        }
    }

    update() {
        let progressGrowth = this.root.dynamicTickrate.deltaSeconds * this.root.hubGoals.getMinerBaseSpeed();

        const targetProgress = 1;

        if (G_IS_DEV && globalConfig.debug.instantMiners) {
            progressGrowth = targetProgress;
        }

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const minerComp = entity.components.Miner;

            // Check if miner is above an actual tile
            if (!minerComp.cachedMinedItem) {
                const staticComp = entity.components.StaticMapEntity;
                const tileBelow = this.root.map.getLowerLayerContentXY(
                    staticComp.origin.x,
                    staticComp.origin.y
                );
                if (!tileBelow) {
                    continue;
                }
                minerComp.cachedMinedItem = tileBelow;
            }

            // Reset everything on recompute
            if (this.needsRecompute) {
                minerComp.cachedChainedMiner = null;
                minerComp.cachedExitMiner = null;
            }

            // Check if we are a chained miner
            if (minerComp.chainable) {
                if (!minerComp.cachedChainedMiner) {
                    minerComp.cachedChainedMiner = this.findChainedMiner(entity);
                }

                // don't calculate on the same tick as recompute, or so miners wont have caches yet
                if (minerComp.cachedChainedMiner && !minerComp.cachedExitMiner && !this.needsRecompute) {
                    minerComp.cachedExitMiner = this.findExitMiner(entity);
                }

                // Check if we now have a target at the end of the chain - if so, that's what we will progress
                const exitEntity = minerComp.cachedExitMiner;
                if (exitEntity) {
                    const exitMinerComp = exitEntity.components.Miner;
                    exitMinerComp.progress += progressGrowth;
                    continue;
                }
            }
            //console.log(minerComp.progress);

            if (minerComp.progress >= targetProgress) {
                // We can try to eject
                const extraProgress = minerComp.progress - targetProgress;

                const ejectorComp = entity.components.ItemEjector;
                if (ejectorComp.tryEject(0, minerComp.cachedMinedItem, extraProgress)) {
                    // Analytics hook
                    this.root.signals.itemProduced.dispatch(minerComp.cachedMinedItem);

                    minerComp.progress -= targetProgress;
                }
            }

            if (minerComp.progress < targetProgress) {
                minerComp.progress += progressGrowth;
            }

            if (minerComp.progress >= targetProgress) {
                // We can try to eject
                const extraProgress = minerComp.progress - targetProgress;

                const ejectorComp = entity.components.ItemEjector;
                if (ejectorComp.tryEject(0, minerComp.cachedMinedItem, extraProgress)) {
                    // Analytics hook
                    this.root.signals.itemProduced.dispatch(minerComp.cachedMinedItem);

                    minerComp.progress -= targetProgress;
                }
            }
        }

        // After this frame we are done
        this.needsRecompute = false;
    }

    /**
     * Finds the target chained miner for a given entity
     * @param {Entity} entity
     * @returns {Entity|false} The chained entity or null if not found
     */
    findChainedMiner(entity) {
        const ejectComp = entity.components.ItemEjector;
        const staticComp = entity.components.StaticMapEntity;
        const minedItem = entity.components.Miner.cachedMinedItem;
        const contentsBelow = this.root.map.getLowerLayerContentXY(staticComp.origin.x, staticComp.origin.y);
        if (!contentsBelow) {
            // This miner has no contents
            return null;
        }

        const ejectingSlot = ejectComp.slots[0];
        const ejectingPos = staticComp.localTileToWorld(ejectingSlot.pos);
        const ejectingDirection = staticComp.localDirectionToWorld(ejectingSlot.direction);

        const targetTile = ejectingPos.add(enumDirectionToVector[ejectingDirection]);
        const targetContents = this.root.map.getTileContent(targetTile, "regular");

        // Check if we are connected to another miner and thus do not eject directly
        if (targetContents) {
            const targetMinerComp = targetContents.components.Miner;
            if (
                targetMinerComp &&
                targetMinerComp.chainable &&
                targetMinerComp.cachedMinedItem == minedItem
            ) {
                const targetLowerLayer = this.root.map.getLowerLayerContentXY(targetTile.x, targetTile.y);
                if (targetLowerLayer) {
                    return targetContents;
                }
            }
        }

        return false;
    }

    /**
     * Finds the target exit miner for a given entity
     * @param {Entity} entity
     * @returns {Entity|false} The exit miner entity or null if not found
     */
    findExitMiner(entity) {
        const minerComp = entity.components.Miner;
        // Recompute exit miner if we are not at the front
        let targetEntity = minerComp.cachedChainedMiner;

        const ourPosition = entity.components.StaticMapEntity.origin;

        /** @type {Entity|null|false} */
        let nextTarget = targetEntity;
        while (nextTarget) {
            targetEntity = nextTarget;
            if (targetEntity.components.StaticMapEntity.origin == ourPosition) {
                // we are in a loop, do nothing
                targetEntity = null;
                break;
            }
            const targetMinerComp = targetEntity.components.Miner;
            nextTarget = targetMinerComp.cachedChainedMiner;
        }

        if (targetEntity) {
            const targetMinerComp = targetEntity.components.Miner;
            if (targetMinerComp.cachedMinedItem == minerComp.cachedMinedItem) {
                // only chain the same items
                return targetEntity;
            }
        }
        return false;
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;

        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const minerComp = entity.components.Miner;
            if (!minerComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            if (!minerComp.cachedMinedItem) {
                continue;
            }

            // Draw the item background - this is to hide the ejected item animation from
            // the item ejector

            const padding = 3;
            const destX = staticComp.origin.x * globalConfig.tileSize + padding;
            const destY = staticComp.origin.y * globalConfig.tileSize + padding;
            const dimensions = globalConfig.tileSize - 2 * padding;

            if (parameters.visibleRect.containsRect4Params(destX, destY, dimensions, dimensions)) {
                parameters.context.fillStyle = minerComp.cachedMinedItem.getBackgroundColorAsResource();
                parameters.context.fillRect(destX, destY, dimensions, dimensions);
            }

            minerComp.cachedMinedItem.drawItemCenteredClipped(
                (0.5 + staticComp.origin.x) * globalConfig.tileSize,
                (0.5 + staticComp.origin.y) * globalConfig.tileSize,
                parameters,
                globalConfig.defaultItemDiameter
            );
        }
    }
}
