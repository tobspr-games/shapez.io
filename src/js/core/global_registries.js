import { SingletonFactory } from "./singleton_factory";
import { Factory } from "./factory";

/* typehints:start */
import { BaseGameSpeed } from "../game/time/base_game_speed";
import { Component } from "../game/component";
import { BaseItem } from "../game/base_item";
import { MetaBuilding } from "../game/meta_building";
/* typehints:end */

// These factories are here to remove circular dependencies

/** @type {SingletonFactoryTemplate<MetaBuilding>} */
export let gMetaBuildingRegistry = new SingletonFactory();

/** @type {Object.<string, Array<typeof MetaBuilding>>} */
export let gBuildingsByCategory = null;

/** @type {FactoryTemplate<Component>} */
export let gComponentRegistry = new Factory("component");

/** @type {FactoryTemplate<BaseGameSpeed>} */
export let gGameSpeedRegistry = new Factory("gamespeed");

/** @type {FactoryTemplate<BaseItem>} */
export let gItemRegistry = new Factory("item");

// Helpers

/**
 * @param {Object.<string, Array<typeof MetaBuilding>>} buildings
 */
export function initBuildingsByCategory(buildings) {
    gBuildingsByCategory = buildings;
}
