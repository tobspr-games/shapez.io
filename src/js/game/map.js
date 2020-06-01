/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { globalConfig } from "../core/config";
import { Vector } from "../core/vector";
import { Entity } from "./entity";
import { Math_floor } from "../core/builtins";
import { createLogger } from "../core/logging";
import { BaseItem } from "./base_item";
import { MapChunkView } from "./map_chunk_view";
import { randomInt } from "../core/utils";
import { BasicSerializableObject, types } from "../savegame/serialization";

const logger = createLogger("map");

export class BaseMap extends BasicSerializableObject {
    static getId() {
        return "Map";
    }

    static getSchema() {
        return {
            seed: types.uint,
        };
    }

    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        super();
        this.root = root;

        this.seed = 0;

        /**
         * Mapping of 'X|Y' to chunk
         * @type {Map<string, MapChunkView>} */
        this.chunksById = new Map();
    }

    /**
     * Returns the given chunk by index
     * @param {number} chunkX
     * @param {number} chunkY
     */
    getChunk(chunkX, chunkY, createIfNotExistent = false) {
        // TODO: Better generation
        const chunkIdentifier = chunkX + "|" + chunkY;
        let storedChunk;

        if ((storedChunk = this.chunksById.get(chunkIdentifier))) {
            return storedChunk;
        }

        if (createIfNotExistent) {
            const instance = new MapChunkView(this.root, chunkX, chunkY);
            this.chunksById.set(chunkIdentifier, instance);
            return instance;
        }

        return null;
    }

    /**
     * Gets or creates a new chunk if not existent for the given tile
     * @param {number} tileX
     * @param {number} tileY
     * @returns {MapChunkView}
     */
    getOrCreateChunkAtTile(tileX, tileY) {
        const chunkX = Math_floor(tileX / globalConfig.mapChunkSize);
        const chunkY = Math_floor(tileY / globalConfig.mapChunkSize);
        return this.getChunk(chunkX, chunkY, true);
    }

    /**
     * Gets a chunk if not existent for the given tile
     * @param {number} tileX
     * @param {number} tileY
     * @returns {MapChunkView?}
     */
    getChunkAtTileOrNull(tileX, tileY) {
        const chunkX = Math_floor(tileX / globalConfig.mapChunkSize);
        const chunkY = Math_floor(tileY / globalConfig.mapChunkSize);
        return this.getChunk(chunkX, chunkY, false);
    }

    /**
     * Checks if a given tile is within the map bounds
     * @param {Vector} tile
     * @returns {boolean}
     */
    isValidTile(tile) {
        if (G_IS_DEV && !globalConfig.debug.disableInternalCheckTile) {
            assert(tile instanceof Vector, "tile is not a vector");
        }
        return Number.isInteger(tile.x) && Number.isInteger(tile.y);
    }

    /**
     * Returns the tile content of a given tile
     * @param {Vector} tile
     * @returns {Entity} Entity or null
     */
    getTileContent(tile) {
        if (G_IS_DEV && !globalConfig.debug.disableInternalCheckTile) {
            this.internalCheckTile(tile);
        }
        const chunk = this.getChunkAtTileOrNull(tile.x, tile.y);
        return chunk && chunk.getTileContentFromWorldCoords(tile.x, tile.y);
    }

    /**
     * Returns the lower layers content of the given tile
     * @param {number} x
     * @param {number} y
     * @returns {BaseItem=}
     */
    getLowerLayerContentXY(x, y) {
        return this.getOrCreateChunkAtTile(x, y).getLowerLayerFromWorldCoords(x, y);
    }

    /**
     * Returns the tile content of a given tile
     * @param {number} x
     * @param {number} y
     * @returns {Entity} Entity or null
     */
    getTileContentXY(x, y) {
        const chunk = this.getChunkAtTileOrNull(x, y);
        return chunk && chunk.getTileContentFromWorldCoords(x, y);
    }

    /**
     * Checks if the tile is used
     * @param {Vector} tile
     * @returns {boolean}
     */
    isTileUsed(tile) {
        if (G_IS_DEV && !globalConfig.debug.disableInternalCheckTile) {
            this.internalCheckTile(tile);
        }
        const chunk = this.getChunkAtTileOrNull(tile.x, tile.y);
        return chunk && chunk.getTileContentFromWorldCoords(tile.x, tile.y) != null;
    }

    /**
     * Checks if the tile is used
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isTileUsedXY(x, y) {
        const chunk = this.getChunkAtTileOrNull(x, y);
        return chunk && chunk.getTileContentFromWorldCoords(x, y) != null;
    }

    /**
     * Sets the tiles content
     * @param {Vector} tile
     * @param {Entity} entity
     */
    setTileContent(tile, entity) {
        if (G_IS_DEV && !globalConfig.debug.disableInternalCheckTile) {
            this.internalCheckTile(tile);
        }

        this.getOrCreateChunkAtTile(tile.x, tile.y).setTileContentFromWorldCords(tile.x, tile.y, entity);

        const staticComponent = entity.components.StaticMapEntity;
        assert(staticComponent, "Can only place static map entities in tiles");
    }

    /**
     * Places an entity with the StaticMapEntity component
     * @param {Entity} entity
     */
    placeStaticEntity(entity) {
        assert(entity.components.StaticMapEntity, "Entity is not static");
        const staticComp = entity.components.StaticMapEntity;
        const rect = staticComp.getTileSpaceBounds();
        for (let dx = 0; dx < rect.w; ++dx) {
            for (let dy = 0; dy < rect.h; ++dy) {
                const x = rect.x + dx;
                const y = rect.y + dy;
                this.getOrCreateChunkAtTile(x, y).setTileContentFromWorldCords(x, y, entity);
            }
        }
    }

    /**
     * Removes an entity with the StaticMapEntity component
     * @param {Entity} entity
     */
    removeStaticEntity(entity) {
        assert(entity.components.StaticMapEntity, "Entity is not static");
        const staticComp = entity.components.StaticMapEntity;
        const rect = staticComp.getTileSpaceBounds();
        for (let dx = 0; dx < rect.w; ++dx) {
            for (let dy = 0; dy < rect.h; ++dy) {
                const x = rect.x + dx;
                const y = rect.y + dy;
                this.getOrCreateChunkAtTile(x, y).setTileContentFromWorldCords(x, y, null);
            }
        }
    }

    /**
     * Resets the tiles content
     * @param {Vector} tile
     */
    clearTile(tile) {
        if (G_IS_DEV && !globalConfig.debug.disableInternalCheckTile) {
            this.internalCheckTile(tile);
        }
        this.getOrCreateChunkAtTile(tile.x, tile.y).setTileContentFromWorldCords(tile.x, tile.y, null);
    }

    // Internal

    /**
     * Checks a given tile for validty
     * @param {Vector} tile
     */
    internalCheckTile(tile) {
        assert(tile instanceof Vector, "tile is not a vector: " + tile);
        assert(tile.x % 1 === 0, "Tile X is not a valid integer: " + tile.x);
        assert(tile.y % 1 === 0, "Tile Y is not a valid integer: " + tile.y);
    }
}
