import { ExplainedResult } from "../core/explained_result";
import { createLogger } from "../core/logging";
import { ReadWriteProxy } from "../core/read_write_proxy";
import { globalConfig } from "../core/config";
import { Savegame } from "./savegame";
const logger = createLogger("savegame_manager");
const Rusha = require("rusha");
export type SavegamesData = import("./savegame_typedefs").SavegamesData;
export type SavegameMetadata = import("./savegame_typedefs").SavegameMetadata;

/** @enum {string} */
export const enumLocalSavegameStatus = {
    offline: "offline",
    synced: "synced",
};
export class SavegameManager extends ReadWriteProxy {
    public currentData = this.getDefaultData();

    constructor(app) {
        super(app, "savegames.bin");
    }
    // RW Proxy Impl
    /**
     * {}
     */
    getDefaultData(): SavegamesData {
        return {
            version: this.getCurrentVersion(),
            savegames: [],
        };
    }
    getCurrentVersion() {
        return 1002;
    }
    verify(data) {
        // @TODO
        return ExplainedResult.good();
    }
        migrate(data: SavegamesData) {
        if (data.version < 1001) {
            data.savegames.forEach(savegame => {
                savegame.level = 0;
            });
            data.version = 1001;
        }
        if (data.version < 1002) {
            data.savegames.forEach(savegame => {
                savegame.name = null;
            });
            data.version = 1002;
        }
        return ExplainedResult.good();
    }
    // End rw proxy
    /**
     * {}
     */
    getSavegamesMetaData(): Array<SavegameMetadata> {
        return this.currentData.savegames;
    }
    /**
     *
     * {}
     */
    getSavegameById(internalId: string): Savegame {
        const metadata = this.getGameMetaDataByInternalId(internalId);
        if (!metadata) {
            return null;
        }
        return new Savegame(this.app, { internalId, metaDataRef: metadata });
    }
    /**
     * Deletes a savegame
     */
    deleteSavegame(game: SavegameMetadata) {
        const handle = new Savegame(this.app, {
            internalId: game.internalId,
            metaDataRef: game,
        });
        return handle
            .deleteAsync()
            .catch(err => {
            console.warn("Failed to unlink physical savegame file, still removing:", err);
        })
            .then(() => {
            for (let i = 0; i < this.currentData.savegames.length; ++i) {
                const potentialGame = this.currentData.savegames[i];
                if (potentialGame.internalId === handle.internalId) {
                    this.currentData.savegames.splice(i, 1);
                    break;
                }
            }
            return this.writeAsync();
        });
    }
    /**
     * Returns a given games metadata by id
     * {}
     */
    getGameMetaDataByInternalId(id: string): SavegameMetadata {
        for (let i = 0; i < this.currentData.savegames.length; ++i) {
            const data = this.currentData.savegames[i];
            if (data.internalId === id) {
                return data;
            }
        }
        logger.error("Savegame internal id not found:", id);
        return null;
    }
    /**
     * Creates a new savegame
     * {}
     */
    createNewSavegame(): Savegame {
        const id = this.generateInternalId();
        const metaData = {
            lastUpdate: Date.now(),
            version: Savegame.getCurrentVersion(),
            internalId: id,
        } as SavegameMetadata);
        this.currentData.savegames.push(metaData);
        // Notice: This is async and happening in the background
        this.updateAfterSavegamesChanged();
        return new Savegame(this.app, {
            internalId: id,
            metaDataRef: metaData,
        });
    }
    /**
     * Attempts to import a savegame
     */
    importSavegame(data: object) {
        const savegame = this.createNewSavegame();
        const migrationResult = savegame.migrate(data);
        if (migrationResult.isBad()) {
            return Promise.reject("Failed to migrate: " + migrationResult.reason);
        }
        savegame.currentData = data;
        const verification = savegame.verify(data);
        if (verification.isBad()) {
            return Promise.reject("Verification failed: " + verification.result);
        }
        return savegame.writeSavegameAndMetadata().then(() => this.updateAfterSavegamesChanged());
    }
    /**
     * Hook after the savegames got changed
     */
    updateAfterSavegamesChanged() {
        return this.sortSavegames().then(() => this.writeAsync());
    }
    /**
     * Sorts all savegames by their creation time descending
     * {}
     */
    sortSavegames(): Promise<any> {
        this.currentData.savegames.sort((a, b) => b.lastUpdate - a.lastUpdate);
        let promiseChain = Promise.resolve();
        while (this.currentData.savegames.length > 30) {
            const toRemove = this.currentData.savegames.pop();
            // Try to remove the savegame since its no longer available
            const game = new Savegame(this.app, {
                internalId: toRemove.internalId,
                metaDataRef: toRemove,
            });
            promiseChain = promiseChain
                .then(() => game.deleteAsync())
                .then(() => { }, err => {
                logger.error(this, "Failed to remove old savegame:", toRemove, ":", err);
            });
        }
        return promiseChain;
    }
    /**
     * Helper method to generate a new internal savegame id
     */
    generateInternalId() {
        return Rusha.createHash()
            .update(Date.now() + "/" + Math.random())
            .digest("hex");
    }
    // End
    initialize() {
        // First read, then directly write to ensure we have the latest data
        // @ts-ignore
        return this.readAsync().then(() => {
            if (G_IS_DEV && globalConfig.debug.disableSavegameWrite) {
                return Promise.resolve();
            }
            return this.updateAfterSavegamesChanged();
        });
    }
}
