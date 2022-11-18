import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { enumDirectionToVector } from "../../core/vector";
import { BaseItem } from "../base_item";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
export class MinerSystem extends GameSystemWithFilter {
    public needsRecompute = true;

    constructor(root) {
        super(root, [MinerComponent]);
        this.root.signals.entityAdded.add(this.onEntityChanged, this);
        this.root.signals.entityChanged.add(this.onEntityChanged, this);
        this.root.signals.entityDestroyed.add(this.onEntityChanged, this);
    }
    /**
     * Called whenever an entity got changed
     */
    onEntityChanged(entity: Entity): any {
        const minerComp: any = entity.components.Miner;
        if (minerComp && minerComp.chainable) {
            // Miner component, need to recompute
            this.needsRecompute = true;
        }
    }
    update(): any {
        let miningSpeed: any = this.root.hubGoals.getMinerBaseSpeed();
        if (G_IS_DEV && globalConfig.debug.instantMiners) {
            miningSpeed *= 100;
        }
        for (let i: any = 0; i < this.allEntities.length; ++i) {
            const entity: any = this.allEntities[i];
            const minerComp: any = entity.components.Miner;
            // Reset everything on recompute
            if (this.needsRecompute) {
                minerComp.cachedChainedMiner = null;
            }
            // Check if miner is above an actual tile
            if (!minerComp.cachedMinedItem) {
                const staticComp: any = entity.components.StaticMapEntity;
                const tileBelow: any = this.root.map.getLowerLayerContentXY(staticComp.origin.x, staticComp.origin.y);
                if (!tileBelow) {
                    continue;
                }
                minerComp.cachedMinedItem = tileBelow;
            }
            // First, try to get rid of chained items
            if (minerComp.itemChainBuffer.length > 0) {
                if (this.tryPerformMinerEject(entity, minerComp.itemChainBuffer[0])) {
                    minerComp.itemChainBuffer.shift();
                    continue;
                }
            }
            const mineDuration: any = 1 / miningSpeed;
            const timeSinceMine: any = this.root.time.now() - minerComp.lastMiningTime;
            if (timeSinceMine > mineDuration) {
                // Store how much we overflowed
                const buffer: any = Math.min(timeSinceMine - mineDuration, this.root.dynamicTickrate.deltaSeconds);
                if (this.tryPerformMinerEject(entity, minerComp.cachedMinedItem)) {
                    // Analytics hook
                    this.root.signals.itemProduced.dispatch(minerComp.cachedMinedItem);
                    // Store mining time
                    minerComp.lastMiningTime = this.root.time.now() - buffer;
                }
            }
        }
        // After this frame we are done
        this.needsRecompute = false;
    }
    /**
     * Finds the target chained miner for a given entity
     * {} The chained entity or null if not found
     */
    findChainedMiner(entity: Entity): Entity | false {
        const ejectComp: any = entity.components.ItemEjector;
        const staticComp: any = entity.components.StaticMapEntity;
        const contentsBelow: any = this.root.map.getLowerLayerContentXY(staticComp.origin.x, staticComp.origin.y);
        if (!contentsBelow) {
            // This miner has no contents
            return null;
        }
        const ejectingSlot: any = ejectComp.slots[0];
        const ejectingPos: any = staticComp.localTileToWorld(ejectingSlot.pos);
        const ejectingDirection: any = staticComp.localDirectionToWorld(ejectingSlot.direction);
        const targetTile: any = ejectingPos.add(enumDirectionToVector[ejectingDirection]);
        const targetContents: any = this.root.map.getTileContent(targetTile, "regular");
        // Check if we are connected to another miner and thus do not eject directly
        if (targetContents) {
            const targetMinerComp: any = targetContents.components.Miner;
            if (targetMinerComp && targetMinerComp.chainable) {
                const targetLowerLayer: any = this.root.map.getLowerLayerContentXY(targetTile.x, targetTile.y);
                if (targetLowerLayer) {
                    return targetContents;
                }
            }
        }
        return false;
    }
        tryPerformMinerEject(entity: Entity, item: BaseItem): any {
        const minerComp: any = entity.components.Miner;
        const ejectComp: any = entity.components.ItemEjector;
        // Check if we are a chained miner
        if (minerComp.chainable) {
            const targetEntity: any = minerComp.cachedChainedMiner;
            // Check if the cache has to get recomputed
            if (targetEntity === null) {
                minerComp.cachedChainedMiner = this.findChainedMiner(entity);
            }
            // Check if we now have a target
            if (targetEntity) {
                const targetMinerComp: any = targetEntity.components.Miner;
                if (targetMinerComp.tryAcceptChainedItem(item)) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        // Seems we are a regular miner or at the end of a row, try actually ejecting
        if (ejectComp.tryEject(0, item)) {
            return true;
        }
        return false;
    }
        drawChunk(parameters: DrawParameters, chunk: MapChunkView): any {
        const contents: any = chunk.containedEntitiesByLayer.regular;
        for (let i: any = 0; i < contents.length; ++i) {
            const entity: any = contents[i];
            const minerComp: any = entity.components.Miner;
            if (!minerComp) {
                continue;
            }
            const staticComp: any = entity.components.StaticMapEntity;
            if (!minerComp.cachedMinedItem) {
                continue;
            }
            // Draw the item background - this is to hide the ejected item animation from
            // the item ejector
            const padding: any = 3;
            const destX: any = staticComp.origin.x * globalConfig.tileSize + padding;
            const destY: any = staticComp.origin.y * globalConfig.tileSize + padding;
            const dimensions: any = globalConfig.tileSize - 2 * padding;
            if (parameters.visibleRect.containsRect4Params(destX, destY, dimensions, dimensions)) {
                parameters.context.fillStyle = minerComp.cachedMinedItem.getBackgroundColorAsResource();
                parameters.context.fillRect(destX, destY, dimensions, dimensions);
            }
            minerComp.cachedMinedItem.drawItemCenteredClipped((0.5 + staticComp.origin.x) * globalConfig.tileSize, (0.5 + staticComp.origin.y) * globalConfig.tileSize, parameters, globalConfig.defaultItemDiameter);
        }
    }
}
