/* eslint-disable no-unused-vars */
import { Signal } from "../core/signal";
import { RandomNumberGenerator } from "../core/rng";
import { createLogger } from "../core/logging";
// Type hints
/* typehints:start */
import type { GameTime } from "./time/game_time";
import type { EntityManager } from "./entity_manager";
import type { GameSystemManager } from "./game_system_manager";
import type { AchievementProxy } from "./achievement_proxy";
import type { GameHUD } from "./hud/hud";
import type { MapView } from "./map_view";
import type { Camera } from "./camera";
import type { InGameState } from "../states/ingame";
import type { AutomaticSave } from "./automatic_save";
import type { Application } from "../application";
import type { SoundProxy } from "./sound_proxy";
import type { Savegame } from "../savegame/savegame";
import type { GameLogic } from "./logic";
import type { ShapeDefinitionManager } from "./shape_definition_manager";
import type { HubGoals } from "./hub_goals";
import type { BufferMaintainer } from "../core/buffer_maintainer";
import type { ProductionAnalytics } from "./production_analytics";
import type { Entity } from "./entity";
import type { ShapeDefinition } from "./shape_definition";
import type { BaseItem } from "./base_item";
import type { DynamicTickrate } from "./dynamic_tickrate";
import type { KeyActionMapper } from "./key_action_mapper";
import type { Vector } from "../core/vector";
import type { GameMode } from "./game_mode";
/* typehints:end */
const logger = createLogger("game/root");
export const layers: Array<Layer> = ["regular", "wires"];
/**
 * The game root is basically the whole game state at a given point,
 * combining all important classes. We don't have globals, but this
 * class is passed to almost all game classes.
 */
export class GameRoot {
    public app = app;
    public savegame: Savegame = null;
    public gameState: InGameState = null;
    public keyMapper: KeyActionMapper = null;
    public gameWidth = 500;
    public gameHeight = 500;
    public gameIsFresh: boolean = true;
    public logicInitialized: boolean = false;
    public gameInitialized: boolean = false;
    public bulkOperationRunning = false;
    public immutableOperationRunning = false;
    public camera: Camera = null;
    public canvas: HTMLCanvasElement = null;
    public context: CanvasRenderingContext2D = null;
    public map: MapView = null;
    public logic: GameLogic = null;
    public entityMgr: EntityManager = null;
    public hud: GameHUD = null;
    public systemMgr: GameSystemManager = null;
    public time: GameTime = null;
    public hubGoals: HubGoals = null;
    public buffers: BufferMaintainer = null;
    public automaticSave: AutomaticSave = null;
    public soundProxy: SoundProxy = null;
    public achievementProxy: AchievementProxy = null;
    public shapeDefinitionMgr: ShapeDefinitionManager = null;
    public productionAnalytics: ProductionAnalytics = null;
    public dynamicTickrate: DynamicTickrate = null;
    public currentLayer: Layer = "regular";
    public gameMode: GameMode = null;
    public signals = {
        // Entities
        entityManuallyPlaced: new Signal() as TypedSignal<[
            Entity
        ]>),
        entityAdded: new Signal() as TypedSignal<[
            Entity
        ]>),
        entityChanged: new Signal() as TypedSignal<[
            Entity
        ]>),
        entityGotNewComponent: new Signal() as TypedSignal<[
            Entity
        ]>),
        entityComponentRemoved: new Signal() as TypedSignal<[
            Entity
        ]>),
        entityQueuedForDestroy: new Signal() as TypedSignal<[
            Entity
        ]>),
        entityDestroyed: new Signal() as TypedSignal<[
            Entity
        ]>),
        // Global
        resized: new Signal() as TypedSignal<[
            number,
            number
        ]>),
        readyToRender: new Signal() as TypedSignal<[
        ]>),
        aboutToDestruct: ew Signal(),
        // Game Hooks
        gameSaved: new Signal() as TypedSignal<[
        ]>),
        gameRestored: new Signal() as TypedSignal<[
        ]>),
        gameFrameStarted: new Signal() as TypedSignal<[
        ]>),
        storyGoalCompleted: new Signal() as TypedSignal<[
            number,
            string
        ]>),
        upgradePurchased: new Signal() as TypedSignal<[
            string
        ]>),
        // Called right after game is initialized
        postLoadHook: new Signal() as TypedSignal<[
        ]>),
        shapeDelivered: new Signal() as TypedSignal<[
            ShapeDefinition
        ]>),
        itemProduced: new Signal() as TypedSignal<[
            BaseItem
        ]>),
        bulkOperationFinished: new Signal() as TypedSignal<[
        ]>),
        immutableOperationFinished: new Signal() as TypedSignal<[
        ]>),
        editModeChanged: new Signal() as TypedSignal<[
            Layer
        ]>),
        // Called to check if an entity can be placed, second parameter is an additional offset.
        // Use to introduce additional placement checks
        prePlacementCheck: new Signal() as TypedSignal<[
            Entity,
            Vector
        ]>),
        // Called before actually placing an entity, use to perform additional logic
        // for freeing space before actually placing.
        freeEntityAreaBeforeBuild: new Signal() as TypedSignal<[
            Entity
        ]>),
        // Called with an achievement key and necessary args to validate it can be unlocked.
        achievementCheck: new Signal() as TypedSignal<[
            string,
            any
        ]>),
        bulkAchievementCheck: new Signal() as TypedSignal<(string | any)[]>),
        // Puzzle mode
        puzzleComplete: new Signal() as TypedSignal<[
        ]>),
    };
    public rngs: {
        [idx: string]: Object<string, RandomNumberGenerator>;
    } = {};
    public queue = {
        requireRedraw: false,
    };
    /**
     * Constructs a new game root
     */

    constructor(app) {
    }
    /**
     * Destructs the game root
     */
    destruct() {
        logger.log("destructing root");
        this.signals.aboutToDestruct.dispatch();
        this.reset();
    }
    /**
     * Resets the whole root and removes all properties
     */
    reset() {
        if (this.signals) {
            // Destruct all signals
            for (let i = 0; i < this.signals.length; ++i) {
                this.signals[i].removeAll();
            }
        }
        if (this.hud) {
            this.hud.cleanup();
        }
        if (this.camera) {
            this.camera.cleanup();
        }
        // Finally free all properties
        for (let prop in this) {
            if (this.hasOwnProperty(prop)) {
                delete this[prop];
            }
        }
    }
}
