/**
 * @typedef {{
 *  buildingsPlaced: number
 * }} SavegameStats
 */

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   uid: number,
 *   key: string
 * }} SerializedMapResource
 */

/**
 * @typedef {{
 *   camera: any,
 *   time: any,
 *   entityMgr: any,
 *   map: any,
 *   hubGoals: any,
 *   entities: Array<any>
 * }} SerializedGame
 */

/**
 * @typedef {{
 *   version: number,
 *   dump: SerializedGame,
 *   stats: SavegameStats,
 *   lastUpdate: number
 * }} SavegameData
 */
