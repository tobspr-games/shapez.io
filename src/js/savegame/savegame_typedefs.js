/**
 * @typedef {import("../game/entity").Entity} Entity
 *
 * @typedef {{
 *   id: string;
 *   version: string;
 *   website: string;
 *   name: string;
 *   author: string;
 * }[]} SavegameStoredMods
 *
 * @typedef {{
 *   failedMam: boolean,
 *   trashedCount: number,
 *   usedInverseRotater: boolean
 * }} SavegameStats
 *
 * @typedef {{
 *   camera: any,
 *   time: any,
 *   entityMgr: any,
 *   map: any,
 *   gameMode: object,
 *   hubGoals: any,
 *   pinnedShapes: any,
 *   waypoints: any,
 *   entities: Array<Entity>,
 *   beltPaths: Array<any>,
 *   modExtraData: Object
 * }} SerializedGame
 *
 * @typedef {{
 *   version: number,
 *   dump: SerializedGame,
 *   stats: SavegameStats,
 *   lastUpdate: number,
 *   mods: SavegameStoredMods
 * }} SavegameData
 *
 * @typedef {{
 *   lastUpdate: number,
 *   version: number,
 *   internalId: string,
 *   level: number
 *   name: string|null
 * }} SavegameMetadata
 *
 * @typedef {{
 *   version: number,
 *   savegames: Array<SavegameMetadata>
 * }} SavegamesData
 */

import { MetaBuilding } from "../game/meta_building";

// Notice: Update backend too
/**
 * @typedef {{
 * id: number;
 * shortKey: string;
 * likes: number;
 * downloads: number;
 * completions: number;
 * difficulty: number | null;
 * averageTime: number | null;
 * title: string;
 * author: string;
 * completed: boolean;
 * }} PuzzleMetadata
 */

/**
 * @typedef {{
 *   type: "emitter";
 *   item: string;
 *   pos: { x: number; y: number; r: number }
 * }} PuzzleGameBuildingConstantProducer
 */

/**
 * @typedef {{
 *   type: "goal";
 *   item: string;
 *   pos: { x: number; y: number; r: number }
 * }} PuzzleGameBuildingGoal
 */

/**
 * @typedef {{
 *   type: "block";
 *   pos: { x: number; y: number; r: number }
 * }} PuzzleGameBuildingBlock
 */

/**
 * @typedef {{
 *   version: number;
 *   bounds: { w: number; h: number; },
 *   buildings: (PuzzleGameBuildingGoal | PuzzleGameBuildingConstantProducer | PuzzleGameBuildingBlock)[],
 *   excludedBuildings: Array<string>,
 * }} PuzzleGameData
 */

/**
 * @typedef {{
 *   meta: PuzzleMetadata,
 *   game: PuzzleGameData
 * }} PuzzleFullData
 */

export default {};
