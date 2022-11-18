import { globalConfig } from "../core/config";
import { Vector } from "../core/vector";
import { BasicSerializableObject, types } from "../savegame/serialization";
import { BaseItem } from "./base_item";
import { Entity } from "./entity";
import { MapChunkAggregate } from "./map_chunk_aggregate";
import { MapChunkView } from "./map_chunk_view";
import { GameRoot } from "./root";
export class BaseMap extends BasicSerializableObject {
    static getId(): any {
        return "Map";
    }
    static getSchema(): any {
        return {
            seed: types.uint,
        };
    }
    public root = root;
    public seed = 0;
    public chunksById: Map<string, MapChunkView> = new Map();
    public aggregatesById: Map<string, MapChunkAggregate> = new Map();

        constructor(root) {
        super();
    }
    /**
     * Returns the given chunk by index
     */
    getChunk(chunkX: number, chunkY: number, createIfNotExistent: any = false): any {
        const chunkIdentifier: any = chunkX + "|" + chunkY;
        let storedChunk: any;
        if ((storedChunk = this.chunksById.get(chunkIdentifier))) {
            return storedChunk;
        }
        if (createIfNotExistent) {
            const instance: any = new MapChunkView(this.root, chunkX, chunkY);
            this.chunksById.set(chunkIdentifier, instance);
            return instance;
        }
        return null;
    }
    /**
     * Returns the chunk aggregate containing a given chunk
     */
    getAggregateForChunk(chunkX: number, chunkY: number, createIfNotExistent: any = false): any {
        const aggX: any = Math.floor(chunkX / globalConfig.chunkAggregateSize);
        const aggY: any = Math.floor(chunkY / globalConfig.chunkAggregateSize);
        return this.getAggregate(aggX, aggY, createIfNotExistent);
    }
    /**
     * Returns the given chunk aggregate by index
     */
    getAggregate(aggX: number, aggY: number, createIfNotExistent: any = false): any {
        const aggIdentifier: any = aggX + "|" + aggY;
        let storedAggregate: any;
        if ((storedAggregate = this.aggregatesById.get(aggIdentifier))) {
            return storedAggregate;
        }
        if (createIfNotExistent) {
            const instance: any = new MapChunkAggregate(this.root, aggX, aggY);
            this.aggregatesById.set(aggIdentifier, instance);
            return instance;
        }
        return null;
    }
    /**
     * Gets or creates a new chunk if not existent for the given tile
     * {}
     */
    getOrCreateChunkAtTile(tileX: number, tileY: number): MapChunkView {
        const chunkX: any = Math.floor(tileX / globalConfig.mapChunkSize);
        const chunkY: any = Math.floor(tileY / globalConfig.mapChunkSize);
        return this.getChunk(chunkX, chunkY, true);
    }
    /**
     * Gets a chunk if not existent for the given tile
     * {}
     */
    getChunkAtTileOrNull(tileX: number, tileY: number): ?MapChunkView {
        const chunkX: any = Math.floor(tileX / globalConfig.mapChunkSize);
        const chunkY: any = Math.floor(tileY / globalConfig.mapChunkSize);
        return this.getChunk(chunkX, chunkY, false);
    }
    /**
     * Checks if a given tile is within the map bounds
     * {}
     */
    isValidTile(tile: Vector): boolean {
        if (G_IS_DEV) {
            assert(tile instanceof Vector, "tile is not a vector");
        }
        return Number.isInteger(tile.x) && Number.isInteger(tile.y);
    }
    /**
     * Returns the tile content of a given tile
     * {} Entity or null
     */
    getTileContent(tile: Vector, layer: Layer): Entity {
        if (G_IS_DEV) {
            this.internalCheckTile(tile);
        }
        const chunk: any = this.getChunkAtTileOrNull(tile.x, tile.y);
        return chunk && chunk.getLayerContentFromWorldCoords(tile.x, tile.y, layer);
    }
    /**
     * Returns the lower layers content of the given tile
     * {}
     */
    getLowerLayerContentXY(x: number, y: number): BaseItem= {
        return this.getOrCreateChunkAtTile(x, y).getLowerLayerFromWorldCoords(x, y);
    }
    /**
     * Returns the tile content of a given tile
     * {} Entity or null
     */
    getLayerContentXY(x: number, y: number, layer: Layer): Entity {
        const chunk: any = this.getChunkAtTileOrNull(x, y);
        return chunk && chunk.getLayerContentFromWorldCoords(x, y, layer);
    }
    /**
     * Returns the tile contents of a given tile
     * {} Entity or null
     */
    getLayersContentsMultipleXY(x: number, y: number): Array<Entity> {
        const chunk: any = this.getChunkAtTileOrNull(x, y);
        if (!chunk) {
            return [];
        }
        return chunk.getLayersContentsMultipleFromWorldCoords(x, y);
    }
    /**
     * Checks if the tile is used
     * {}
     */
    isTileUsed(tile: Vector, layer: Layer): boolean {
        if (G_IS_DEV) {
            this.internalCheckTile(tile);
        }
        const chunk: any = this.getChunkAtTileOrNull(tile.x, tile.y);
        return chunk && chunk.getLayerContentFromWorldCoords(tile.x, tile.y, layer) != null;
    }
    /**
     * Checks if the tile is used
     * {}
     */
    isTileUsedXY(x: number, y: number, layer: Layer): boolean {
        const chunk: any = this.getChunkAtTileOrNull(x, y);
        return chunk && chunk.getLayerContentFromWorldCoords(x, y, layer) != null;
    }
    /**
     * Sets the tiles content
     */
    setTileContent(tile: Vector, entity: Entity): any {
        if (G_IS_DEV) {
            this.internalCheckTile(tile);
        }
        this.getOrCreateChunkAtTile(tile.x, tile.y).setLayerContentFromWorldCords(tile.x, tile.y, entity, entity.layer);
        const staticComponent: any = entity.components.StaticMapEntity;
        assert(staticComponent, "Can only place static map entities in tiles");
    }
    /**
     * Places an entity with the StaticMapEntity component
     */
    placeStaticEntity(entity: Entity): any {
        assert(entity.components.StaticMapEntity, "Entity is not static");
        const staticComp: any = entity.components.StaticMapEntity;
        const rect: any = staticComp.getTileSpaceBounds();
        for (let dx: any = 0; dx < rect.w; ++dx) {
            for (let dy: any = 0; dy < rect.h; ++dy) {
                const x: any = rect.x + dx;
                const y: any = rect.y + dy;
                this.getOrCreateChunkAtTile(x, y).setLayerContentFromWorldCords(x, y, entity, entity.layer);
            }
        }
    }
    /**
     * Removes an entity with the StaticMapEntity component
     */
    removeStaticEntity(entity: Entity): any {
        assert(entity.components.StaticMapEntity, "Entity is not static");
        const staticComp: any = entity.components.StaticMapEntity;
        const rect: any = staticComp.getTileSpaceBounds();
        for (let dx: any = 0; dx < rect.w; ++dx) {
            for (let dy: any = 0; dy < rect.h; ++dy) {
                const x: any = rect.x + dx;
                const y: any = rect.y + dy;
                this.getOrCreateChunkAtTile(x, y).setLayerContentFromWorldCords(x, y, null, entity.layer);
            }
        }
    }
    // Internal
    /**
     * Checks a given tile for validty
     */
    internalCheckTile(tile: Vector): any {
        assert(tile instanceof Vector, "tile is not a vector: " + tile);
        assert(tile.x % 1 === 0, "Tile X is not a valid integer: " + tile.x);
        assert(tile.y % 1 === 0, "Tile Y is not a valid integer: " + tile.y);
    }
}
