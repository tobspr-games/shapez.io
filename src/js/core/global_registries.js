import { SingletonFactory } from "./singleton_factory";
import { Factory } from "./factory";

/**
 * @typedef {import("../game/time/base_game_speed").BaseGameSpeed} BaseGameSpeed
 * @typedef {import("../game/component").Component} Component
 * @typedef {import("../game/base_item").BaseItem} BaseItem
 * @typedef {import("../game/meta_building").MetaBuilding} MetaBuilding


// These factories are here to remove circular dependencies

/** @type {SingletonFactoryTemplate<MetaBuilding>} */
export let gMetaBuildingRegistry = new SingletonFactory();

/** @type {Object.<string, Array<Class<MetaBuilding>>>} */
export let gBuildingsByCategory = null;

/** @type {FactoryTemplate<Component>} */
export let gComponentRegistry = new Factory("component");

/** @type {FactoryTemplate<BaseGameSpeed>} */
export let gGameSpeedRegistry = new Factory("gamespeed");

/** @type {FactoryTemplate<BaseItem>} */
export let gItemRegistry = new Factory("item");

// Helpers

/**
 * @param {Object.<string, Array<Class<MetaBuilding>>>} buildings
 */
export function initBuildingsByCategory(buildings) {
    gBuildingsByCategory = buildings;
}
