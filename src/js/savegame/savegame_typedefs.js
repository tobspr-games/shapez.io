/**
 * @typedef {{
 *  buildingsPlaced: number
 * }} SavegameStats
 */

import { Entity } from "../game/entity";

/**
 * @typedef {{
 *   camera: any,
 *   time: any,
 *   entityMgr: any,
 *   map: any,
 *   hubGoals: any,
 *   entities: Array<Entity>
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
