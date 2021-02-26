/**
 * @typedef {{}} SavegameStats
 *
 * @typedef {{
 *   camera: any,
 *   time: any,
 *   entityMgr: any,
 *   map: any,
 *   hubGoals: any,
 *   pinnedShapes: any,
 *   waypoints: any,
 *   entities: Array<import("../game/entity").Entity>,
 *   beltPaths: Array<any>
 * }} SerializedGame
 *
 * @typedef {{
 *   version: any,
 *   dump: SerializedGame,
 *   stats: SavegameStats,
 *   lastUpdate: number,
 *   gamemode: string|null,
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

export default {};
