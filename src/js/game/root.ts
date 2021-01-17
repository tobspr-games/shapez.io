/* eslint-disable no-unused-vars */
import { Signal } from "../core/signal";
import { RandomNumberGenerator } from "../core/rng";
import { createLogger } from "../core/logging";

// Type hints
/* typehints:start */
import { GameTime } from "./time/game_time";
import { EntityManager } from "./entity_manager";
import { GameSystemManager } from "./game_system_manager";
import { GameHUD } from "./hud/hud";
import { MapView } from "./map_view";
import { Camera } from "./camera";
import { InGameState } from "../states/ingame";
import { AutomaticSave } from "./automatic_save";
import { Application } from "../application";
import { SoundProxy } from "./sound_proxy";
import { Savegame } from "../savegame/savegame";
import { GameLogic } from "./logic";
import { ShapeDefinitionManager } from "./shape_definition_manager";
import { HubGoals } from "./hub_goals";
import { BufferMaintainer } from "../core/buffer_maintainer";
import { ProductionAnalytics } from "./production_analytics";
import { Entity } from "./entity";
import { ShapeDefinition } from "./shape_definition";
import { BaseItem } from "./base_item";
import { DynamicTickrate } from "./dynamic_tickrate";
import { KeyActionMapper } from "./key_action_mapper";
import { Vector } from "../core/vector";
import { GameMode } from "./game_mode";
/* typehints:end */

const logger = createLogger("game/root");

export const layers: Layer[] = ["regular", "wires"];

/**
 * The game root is basically the whole game state at a given point,
 * combining all important classes. We don't have globals, but this
 * class is passed to almost all game classes.
 */
export class GameRoot {
    app: Application;

    savegame: Savegame | null = null;

    gameState: InGameState | null = null;

    keyMapper: KeyActionMapper | null = null;

    // Store game dimensions
    gameWidth = 500;
    gameHeight = 500;

    // Stores whether the current session is a fresh game (true), or was continued (false)
    gameIsFresh: boolean = true;

    // Stores whether the logic is already initialized
    logicInitialized: boolean = false;

    // Stores whether the game is already initialized, that is, all systems etc have been created
    gameInitialized: boolean = false;

    /**
     * Whether a bulk operation is running
     */
    bulkOperationRunning = false;

    //////// Other properties ///////

    camera: Camera | null = null;

    canvas: HTMLCanvasElement | null = null;

    context: CanvasRenderingContext2D | null = null;

    map: MapView | null = null;

    logic: GameLogic | null = null;

    entityMgr: EntityManager | null = null;

    hud: GameHUD | null = null;

    systemMgr: GameSystemManager | null = null;

    time: GameTime | null = null;

    hubGoals: HubGoals | null = null;

    buffers: BufferMaintainer | null = null;

    automaticSave: AutomaticSave | null = null;

    soundProxy: SoundProxy | null = null;

    shapeDefinitionMgr: ShapeDefinitionManager | null = null;

    productionAnalytics: ProductionAnalytics | null = null;

    dynamicTickrate: DynamicTickrate | null = null;

    currentLayer: Layer = "regular";

    gameMode: GameMode | null = null;

    signals: any;
    rngs: {};
    queue: { requireRedraw: boolean };

    /**
     * Constructs a new game root
     */
    constructor(app: Application) {
        this.app = app;

        this.signals = {
            // Entities
            entityManuallyPlaced: /** @type {TypedSignal<[Entity]>} */ new Signal(),
            entityAdded: /** @type {TypedSignal<[Entity]>} */ new Signal(),
            entityChanged: /** @type {TypedSignal<[Entity]>} */ new Signal(),
            entityGotNewComponent: /** @type {TypedSignal<[Entity]>} */ new Signal(),
            entityComponentRemoved: /** @type {TypedSignal<[Entity]>} */ new Signal(),
            entityQueuedForDestroy: /** @type {TypedSignal<[Entity]>} */ new Signal(),
            entityDestroyed: /** @type {TypedSignal<[Entity]>} */ new Signal(),

            // Global
            resized: /** @type {TypedSignal<[number, number]>} */ new Signal(),
            readyToRender: /** @type {TypedSignal<[]>} */ new Signal(),
            aboutToDestruct: /** @type {TypedSignal<[]>} */ new Signal(),

            // Game Hooks
            gameSaved: /** @type {TypedSignal<[]>} */ new Signal(), // Game got saved
            gameRestored: /** @type {TypedSignal<[]>} */ new Signal(), // Game got restored

            gameFrameStarted: /** @type {TypedSignal<[]>} */ new Signal(), // New frame

            storyGoalCompleted: /** @type {TypedSignal<[number, string]>} */ new Signal(),
            upgradePurchased: /** @type {TypedSignal<[string]>} */ new Signal(),

            // Called right after game is initialized
            postLoadHook: /** @type {TypedSignal<[]>} */ new Signal(),

            shapeDelivered: /** @type {TypedSignal<[ShapeDefinition]>} */ new Signal(),
            itemProduced: /** @type {TypedSignal<[BaseItem]>} */ new Signal(),

            bulkOperationFinished: /** @type {TypedSignal<[]>} */ new Signal(),

            editModeChanged: /** @type {TypedSignal<[Layer]>} */ new Signal(),

            // Called to check if an entity can be placed, second parameter is an additional offset.
            // Use to introduce additional placement checks
            prePlacementCheck: /** @type {TypedSignal<[Entity, Vector]>} */ new Signal(),

            // Called before actually placing an entity, use to perform additional logic
            // for freeing space before actually placing.
            freeEntityAreaBeforeBuild: /** @type {TypedSignal<[Entity]>} */ new Signal(),
        };

        // RNG's
        /** @type {Object.<string, Object.<string, RandomNumberGenerator>>} */
        this.rngs = {};

        // Work queue
        this.queue = {
            requireRedraw: false,
        };
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
        for (const prop in this) {
            if (this.hasOwnProperty(prop)) {
                delete this[prop];
            }
        }
    }
}
