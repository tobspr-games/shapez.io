import { ExplainedResult } from "../core/explained_result";
import { createLogger } from "../core/logging";
import { ReadWriteProxy } from "../core/read_write_proxy";
import { globalConfig } from "../core/config";
import { Savegame } from "./savegame";
const logger: any = createLogger("savegame_manager");
const Rusha: any = require("rusha");
export type SavegamesData = import("./savegame_typedefs").SavegamesData;
export type SavegameMetadata = import("./savegame_typedefs").SavegameMetadata;

/** @enum {string} */
export const enumLocalSavegameStatus: any = {
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
    getCurrentVersion(): any {
        return 1002;
    }
    verify(data: any): any {
        // @TODO
        return ExplainedResult.good();
    }
        migrate(data: SavegamesData): any {
        if (data.version < 1001) {
            data.savegames.forEach((savegame: any): any => {
                savegame.level = 0;
            });
            data.version = 1001;
        }
        if (data.version < 1002) {
            data.savegames.forEach((savegame: any): any => {
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
        const metadata: any = this.getGameMetaDataByInternalId(internalId);
        if (!metadata) {
            return null;
        }
        return new Savegame(this.app, { internalId, metaDataRef: metadata });
    }
    /**
     * Deletes a savegame
     */
    deleteSavegame(game: SavegameMetadata): any {
        const handle: any = new Savegame(this.app, {
            internalId: game.internalId,
            metaDataRef: game,
        });
        return handle
            .deleteAsync()
            .catch((err: any): any => {
            console.warn("Failed to unlink physical savegame file, still removing:", err);
        })
            .then((): any => {
            for (let i: any = 0; i < this.currentData.savegames.length; ++i) {
                const potentialGame: any = this.currentData.savegames[i];
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
        for (let i: any = 0; i < this.currentData.savegames.length; ++i) {
            const data: any = this.currentData.savegames[i];
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
        const id: any = this.generateInternalId();
        const metaData: any = ({
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
    importSavegame(data: object): any {
        const savegame: any = this.createNewSavegame();
        const migrationResult: any = savegame.migrate(data);
        if (migrationResult.isBad()) {
            return Promise.reject("Failed to migrate: " + migrationResult.reason);
        }
        savegame.currentData = data;
        const verification: any = savegame.verify(data);
        if (verification.isBad()) {
            return Promise.reject("Verification failed: " + verification.result);
        }
        return savegame.writeSavegameAndMetadata().then((): any => this.updateAfterSavegamesChanged());
    }
    /**
     * Hook after the savegames got changed
     */
    updateAfterSavegamesChanged(): any {
        return this.sortSavegames().then((): any => this.writeAsync());
    }
    /**
     * Sorts all savegames by their creation time descending
     * {}
     */
    sortSavegames(): Promise<any> {
        this.currentData.savegames.sort((a: any, b: any): any => b.lastUpdate - a.lastUpdate);
        let promiseChain: any = Promise.resolve();
        while (this.currentData.savegames.length > 30) {
            const toRemove: any = this.currentData.savegames.pop();
            // Try to remove the savegame since its no longer available
            const game: any = new Savegame(this.app, {
                internalId: toRemove.internalId,
                metaDataRef: toRemove,
            });
            promiseChain = promiseChain
                .then((): any => game.deleteAsync())
                .then((): any => { }, (err: any): any => {
                logger.error(this, "Failed to remove old savegame:", toRemove, ":", err);
            });
        }
        return promiseChain;
    }
    /**
     * Helper method to generate a new internal savegame id
     */
    generateInternalId(): any {
        return Rusha.createHash()
            .update(Date.now() + "/" + Math.random())
            .digest("hex");
    }
    // End
    initialize(): any {
        // First read, then directly write to ensure we have the latest data
        // @ts-ignore
        return this.readAsync().then((): any => {
            if (G_IS_DEV && globalConfig.debug.disableSavegameWrite) {
                return Promise.resolve();
            }
            return this.updateAfterSavegamesChanged();
        });
    }
}
