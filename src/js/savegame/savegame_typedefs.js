import { Entity } from "../game/entity";

/**
 * @typedef {{
 * }} SavegameStats
 */

/**
 *
 */

/**
 * @typedef {{
 *   camera: any,
 *   time: any,
 *   entityMgr: any,
 *   map: any,
 *   hubGoals: any,
 *   pinnedShapes: any,
 *   waypoints: any,
 *   entities: Array<Entity>,
 *   beltPaths: Array<any>
 * }} SerializedGame
 */

/**
 * @typedef {{
 *   version: number,
 *   dump: SerializedGame,
 *   stats: SavegameStats,
 *   lastUpdate: number,
 * }} SavegameData
 */
