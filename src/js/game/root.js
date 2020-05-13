/* eslint-disable no-unused-vars */

import { Signal } from "../core/signal";
import { RandomNumberGenerator } from "../core/rng";
// import { gFactionRegistry } from "./global_registries";
import { createLogger } from "../core/logging";

// Type hints
/* typehints:start */
import { GameTime } from "./time/game_time";
import { EntityManager } from "./entity_manager";
import { GameSystemManager } from "./game_system_manager";
import { GameHUD } from "./hud/hud";
// import { GameLogic } from "./game_logic";
import { MapView } from "./map_view";
import { Camera } from "./camera";
// import { ParticleManager } from "../particles/particle_manager";
import { InGameState } from "../states/ingame";
// import { CanvasClickInterceptor } from "/canvas_click_interceptor";
import { AutomaticSave } from "./automatic_save";
import { Application } from "../application";
import { SoundProxy } from "./sound_proxy";
import { Savegame } from "../savegame/savegame";
import { GameLogic } from "./logic";
import { ShapeDefinitionManager } from "./shape_definition_manager";
import { CanvasClickInterceptor } from "./canvas_click_interceptor";
import { PerlinNoise } from "../core/perlin_noise";
import { HubGoals } from "./hub_goals";
import { BufferMaintainer } from "../core/buffer_maintainer";
import { ProductionAnalytics } from "./production_analytics";
/* typehints:end */

const logger = createLogger("game/root");

/**
 * The game root is basically the whole game state at a given point,
 * combining all important classes. We don't have globals, but this
 * class is passed to almost all game classes.
 */
export class GameRoot {
    /**
     * Constructs a new game root
     * @param {Application} app
     */
    constructor(app) {
        this.app = app;

        /** @type {Savegame} */
        this.savegame = null;

        /** @type {InGameState} */
        this.gameState = null;

        // Store game dimensions
        this.gameWidth = 500;
        this.gameHeight = 500;

        // Stores whether the current session is a fresh game (true), or was continued (false)
        /** @type {boolean} */
        this.gameIsFresh = true;

        // Stores whether the logic is already initialized
        /** @type {boolean} */
        this.logicInitialized = false;

        // Stores whether the game is already initialized, that is, all systems etc have been created
        /** @type {boolean} */
        this.gameInitialized = false;

        //////// Other properties ///////

        /** @type {Camera} */
        this.camera = null;

        /** @type {HTMLCanvasElement} */
        this.canvas = null;

        /** @type {CanvasRenderingContext2D} */
        this.context = null;

        /** @type {MapView} */
        this.map = null;

        /** @type {GameLogic} */
        this.logic = null;

        /** @type {EntityManager} */
        this.entityMgr = null;

        /** @type {GameHUD} */
        this.hud = null;

        /** @type {GameSystemManager} */
        this.systemMgr = null;

        /** @type {GameTime} */
        this.time = null;

        /** @type {PerlinNoise} */
        this.mapNoiseGenerator = null;

        /** @type {HubGoals} */
        this.hubGoals = null;

        /** @type {BufferMaintainer} */
        this.buffers = null;

        // /** @type {ParticleManager} */
        // this.particleMgr = null;

        // /** @type {ParticleManager} */
        // this.uiParticleMgr = null;

        /** @type {CanvasClickInterceptor} */
        this.canvasClickInterceptor = null;

        /** @type {AutomaticSave} */
        this.automaticSave = null;

        /** @type {SoundProxy} */
        this.soundProxy = null;

        // /** @type {MinimapRenderer} */
        // this.minimapRenderer = null;

        /** @type {ShapeDefinitionManager} */
        this.shapeDefinitionMgr = null;

        /** @type {ProductionAnalytics} */
        this.productionAnalytics = null;

        this.signals = {
            // Entities
            entityAdded: new Signal(/* entity */),
            entityGotNewComponent: new Signal(/* entity */),
            entityQueuedForDestroy: new Signal(/* entity */),
            entityDestroyed: new Signal(/* entity */),

            // Global
            resized: new Signal(/* w, h */), // Game got resized,
            readyToRender: new Signal(),
            aboutToDestruct: new Signal(),

            // Game Hooks
            gameSaved: new Signal(), // Game got saved
            gameRestored: new Signal(), // Game got restored
            gameOver: new Signal(), // Game over

            storyGoalCompleted: new Signal(/* level, reward */),
            upgradePurchased: new Signal(),

            // Called right after game is initialized
            postLoadHook: new Signal(),

            // Can be used to trigger an async task
            performAsync: new Signal(),

            shapeDelivered: new Signal(/* definition */),
            shapeProduced: new Signal(/* definition */),
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
     * Prepares the root for game over, this sets the right flags and
     * detaches all signals so no bad stuff happens
     */
    prepareGameOver() {
        this.gameInitialized = false;
        this.logicInitialized = false;
        // for (const key in this.signals) {
        //     if (key !== "aboutToDestruct") {
        //         this.signals[key].removeAll();
        //     }
        // }
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
