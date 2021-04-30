/**
 * @typedef {import("../game/entity").Entity} Entity
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
 *   beltPaths: Array<any>
 * }} SerializedGame
 *
 * @typedef {{
 *   version: number,
 *   dump: SerializedGame,
 *   stats: SavegameStats,
 *   lastUpdate: number,
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

/**
 * @typedef {{
 *    shortKey: string;
 *    upvotes: number;
 *    playcount: number;
 *    title: string;
 *    author: string;
 *    completed: boolean;
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
 *   version: number;
 *   bounds: { w: number; h: number; },
 *   buildings: (PuzzleGameBuildingGoal | PuzzleGameBuildingConstantProducer)[]
 * }} PuzzleGameData
 */

/**
 * @typedef {{
 *   meta: PuzzleMetadata,
 *   game: PuzzleGameData
 * }} PuzzleFullData
 */

export default {};
