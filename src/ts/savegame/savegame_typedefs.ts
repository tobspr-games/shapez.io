
export type Entity = import("../game/entity").Entity;
export type SavegameStoredMods = {
    id: string;
    version: string;
    website: string;
    name: string;
    author: string;
}[];
export type SavegameStats = {
    failedMam: boolean;
    trashedCount: number;
    usedInverseRotater: boolean;
};
export type SerializedGame = {
    camera: any;
    time: any;
    entityMgr: any;
    map: any;
    gameMode: object;
    hubGoals: any;
    pinnedShapes: any;
    waypoints: any;
    entities: Array<Entity>;
    beltPaths: Array<any>;
    modExtraData: Object;
};
export type SavegameData = {
    version: number;
    dump: SerializedGame;
    stats: SavegameStats;
    lastUpdate: number;
    mods: SavegameStoredMods;
};
export type SavegameMetadata = {
    lastUpdate: number;
    version: number;
    internalId: string;
    level: number;
    name: string | null;
};
export type SavegamesData = {
    version: number;
    savegames: Array<SavegameMetadata>;
};
import { MetaBuilding } from "../game/meta_building";
export type PuzzleMetadata = {
    id: number;
    shortKey: string;
    likes: number;
    downloads: number;
    completions: number;
    difficulty: number | null;
    averageTime: number | null;
    title: string;
    author: string;
    completed: boolean;
};
export type PuzzleGameBuildingConstantProducer = {
    type: "emitter";
    item: string;
    pos: {
        x: number;
        y: number;
        r: number;
    };
};
export type PuzzleGameBuildingGoal = {
    type: "goal";
    item: string;
    pos: {
        x: number;
        y: number;
        r: number;
    };
};
export type PuzzleGameBuildingBlock = {
    type: "block";
    pos: {
        x: number;
        y: number;
        r: number;
    };
};
export type PuzzleGameData = {
    version: number;
    bounds: {
        w: number;
        h: number;
    };
    buildings: (PuzzleGameBuildingGoal | PuzzleGameBuildingConstantProducer | PuzzleGameBuildingBlock)[];
    excludedBuildings: Array<string>;
};
export type PuzzleFullData = {
    meta: PuzzleMetadata;
    game: PuzzleGameData;
};
// Notice: Update backend too






export default {};
