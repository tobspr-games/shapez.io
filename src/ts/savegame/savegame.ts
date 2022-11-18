import { ReadWriteProxy } from "../core/read_write_proxy";
import { ExplainedResult } from "../core/explained_result";
import { SavegameSerializer } from "./savegame_serializer";
import { BaseSavegameInterface } from "./savegame_interface";
import { createLogger } from "../core/logging";
import { globalConfig } from "../core/config";
import { getSavegameInterface, savegameInterfaces } from "./savegame_interface_registry";
import { SavegameInterface_V1001 } from "./schemas/1001";
import { SavegameInterface_V1002 } from "./schemas/1002";
import { SavegameInterface_V1003 } from "./schemas/1003";
import { SavegameInterface_V1004 } from "./schemas/1004";
import { SavegameInterface_V1005 } from "./schemas/1005";
import { SavegameInterface_V1006 } from "./schemas/1006";
import { SavegameInterface_V1007 } from "./schemas/1007";
import { SavegameInterface_V1008 } from "./schemas/1008";
import { SavegameInterface_V1009 } from "./schemas/1009";
import { MODS } from "../mods/modloader";
import { SavegameInterface_V1010 } from "./schemas/1010";
const logger = createLogger("savegame");
export type Application = import("../application").Application;
export type GameRoot = import("../game/root").GameRoot;
export type SavegameData = import("./savegame_typedefs").SavegameData;
export type SavegameMetadata = import("./savegame_typedefs").SavegameMetadata;
export type SavegameStats = import("./savegame_typedefs").SavegameStats;
export type SerializedGame = import("./savegame_typedefs").SerializedGame;

export class Savegame extends ReadWriteProxy {
    public internalId = internalId;
    public metaDataRef = metaDataRef;
    public currentData: SavegameData = this.getDefaultData();

        constructor(app, { internalId, metaDataRef }) {
        super(app, "savegame-" + internalId + ".bin");
        assert(savegameInterfaces[Savegame.getCurrentVersion()], "Savegame interface not defined: " + Savegame.getCurrentVersion());
    }
    //////// RW Proxy Impl //////////
    /**
     * {}
     */
    static getCurrentVersion(): number {
        return 1010;
    }
    /**
     * {}
     */
    static getReaderClass(): typeof BaseSavegameInterface {
        return savegameInterfaces[Savegame.getCurrentVersion()];
    }
    /**
     *
     * @ /**
     *
     */
     /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} app
    
     */
     /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} app
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Application} app
     * @returns
     */
    static createPuzzleSavegame(app: Application) {
        return new Savegame(app, {
            internalId: "puzzle",
            metaDataRef: {
                internalId: "puzzle",
                lastUpdate: 0,
                version: 0,
                level: 0,
                name: "puzzle",
            },
        });
    }
    /**
     * {}
     */
    getCurrentVersion(): number {

        return this.constructor as typeof Savegame).getCurrentVersion();
    }
    /**
     * Returns the savegames default data
     * {}
     */
    getDefaultData(): SavegameData {
        return {
            version: this.getCurrentVersion(),
            dump: null,
            stats: {
                failedMam: false,
                trashedCount: 0,
                usedInverseRotater: false,
            },
            lastUpdate: Date.now(),
            mods: MODS.getModsListForSavegame(),
        };
    }
    /**
     * Migrates the savegames data
     */
    migrate(data: SavegameData) {
        if (data.version < 1000) {
            return ExplainedResult.bad("Can not migrate savegame, too old");
        }
        if (data.version === 1000) {
            SavegameInterface_V1001.migrate1000to1001(data);
            data.version = 1001;
        }
        if (data.version === 1001) {
            SavegameInterface_V1002.migrate1001to1002(data);
            data.version = 1002;
        }
        if (data.version === 1002) {
            SavegameInterface_V1003.migrate1002to1003(data);
            data.version = 1003;
        }
        if (data.version === 1003) {
            SavegameInterface_V1004.migrate1003to1004(data);
            data.version = 1004;
        }
        if (data.version === 1004) {
            SavegameInterface_V1005.migrate1004to1005(data);
            data.version = 1005;
        }
        if (data.version === 1005) {
            SavegameInterface_V1006.migrate1005to1006(data);
            data.version = 1006;
        }
        if (data.version === 1006) {
            SavegameInterface_V1007.migrate1006to1007(data);
            data.version = 1007;
        }
        if (data.version === 1007) {
            SavegameInterface_V1008.migrate1007to1008(data);
            data.version = 1008;
        }
        if (data.version === 1008) {
            SavegameInterface_V1009.migrate1008to1009(data);
            data.version = 1009;
        }
        if (data.version === 1009) {
            SavegameInterface_V1010.migrate1009to1010(data);
            data.version = 1010;
        }
        return ExplainedResult.good();
    }
    /**
     * Verifies the savegames data
     */
    verify(data: SavegameData) {
        if (!data.dump) {
            // Well, guess that works
            return ExplainedResult.good();
        }
        if (!this.getDumpReaderForExternalData(data).validate()) {
            return ExplainedResult.bad("dump-reader-failed-validation");
        }
        return ExplainedResult.good();
    }
    //////// Subclasses interface  ////////
    /**
     * Returns if this game can be saved on disc
     * {}
     */
    isSaveable(): boolean {
        return true;
    }
    /**
     * Returns the statistics of the savegame
     * {}
     */
    getStatistics(): SavegameStats {
        return this.currentData.stats;
    }
    /**
     * Returns the *real* last update of the savegame, not the one of the metadata
     * which could also be the servers one
     */
    getRealLastUpdate() {
        return this.currentData.lastUpdate;
    }
    /**
     * Returns if this game has a serialized game dump
     */
    hasGameDump() {
        return !!this.currentData.dump && this.currentData.dump.entities.length > 0;
    }
    /**
     * Returns the current game dump
     * {}
     */
    getCurrentDump(): SerializedGame {
        return this.currentData.dump;
    }
    /**
     * Returns a reader to access the data
     * {}
     */
    getDumpReader(): BaseSavegameInterface {
        if (!this.currentData.dump) {
            logger.warn("Getting reader on null-savegame dump");
        }

        const cls = this.constructor as typeof Savegame).getReaderClass();
        return new cls(this.currentData);
    }
    /**
     * Returns a reader to access external data
     * {}
     */
    getDumpReaderForExternalData(data): BaseSavegameInterface {
        assert(data.version, "External data contains no version");
        return getSavegameInterface(data);
    }
    ///////// Public Interface ///////////
    /**
     * Updates the last update field so we can send the savegame to the server,
     * WITHOUT Saving!
     */
    setLastUpdate(time) {
        this.currentData.lastUpdate = time;
    }
        updateData(root: GameRoot) {
        // Construct a new serializer
        const serializer = new SavegameSerializer();
        // let timer = performance.now();
        const dump = serializer.generateDumpFromGameRoot(root);
        if (!dump) {
            return false;
        }
        const shadowData = Object.assign({}, this.currentData);
        shadowData.dump = dump;
        shadowData.lastUpdate = new Date().getTime();
        shadowData.version = this.getCurrentVersion();
        shadowData.mods = MODS.getModsListForSavegame();
        const reader = this.getDumpReaderForExternalData(shadowData);
        // Validate (not in prod though)
        if (!G_IS_RELEASE) {
            const validationResult = reader.validate();
            if (!validationResult) {
                return false;
            }
        }
        // Save data
        this.currentData = shadowData;
    }
    /**
     * Writes the savegame as well as its metadata
     */
    writeSavegameAndMetadata() {
        return this.writeAsync().then(() => this.saveMetadata());
    }
    /**
     * Updates the savegames metadata
     */
    saveMetadata() {
        this.metaDataRef.lastUpdate = new Date().getTime();
        this.metaDataRef.version = this.getCurrentVersion();
        if (!this.hasGameDump()) {
            this.metaDataRef.level = 0;
        }
        else {
            this.metaDataRef.level = this.currentData.dump.hubGoals.level;
        }
        return this.app.savegameMgr.writeAsync();
    }
    /**
     * @see ReadWriteProxy.writeAsync
     * {}
     */
    writeAsync(): Promise<any> {
        if (G_IS_DEV && globalConfig.debug.disableSavegameWrite) {
            return Promise.resolve();
        }
        return super.writeAsync();
    }
}
