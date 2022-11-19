import { SingletonFactory } from "./singleton_factory";
import { Factory } from "./factory";

import { BaseGameSpeed } from "../game/time/base_game_speed";
import { Component } from "../game/component";
import { BaseItem } from "../game/base_item";
import { GameMode } from "../game/game_mode";
import { MetaBuilding } from "../game/meta_building";

// These factories are here to remove circular dependencies

export let gMetaBuildingRegistry = new SingletonFactory<MetaBuilding>();

export let gBuildingsByCategory: {
    [idx: string]: Array<Class<MetaBuilding>>;
} = null;

export let gComponentRegistry = new Factory<Component>("component");
export let gGameModeRegistry = new Factory<GameMode>("gameMode");
export let gGameSpeedRegistry = new Factory<BaseGameSpeed>("gamespeed");
export let gItemRegistry = new Factory<BaseItem>("item");

// Helpers

export function initBuildingsByCategory(buildings: { [idx: string]: Array<Class<MetaBuilding>> }) {
    gBuildingsByCategory = buildings;
}
