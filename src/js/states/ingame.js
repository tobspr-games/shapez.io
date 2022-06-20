import { GameState } from "../core/game_state";
import { logSection, createLogger } from "../core/logging";
import { waitNextFrame } from "../core/utils";
import { globalConfig } from "../core/config";
import { GameLoadingOverlay } from "../game/game_loading_overlay";
import { KeyActionMapper } from "../game/key_action_mapper";
import { Savegame } from "../savegame/savegame";
import { GameCore } from "../game/core";
import { MUSIC } from "../platform/sound";
import { enumGameModeIds } from "../game/game_mode";
import { MOD_SIGNALS } from "../mods/mod_signals";
import { HUDModalDialogs } from "../game/hud/parts/modal_dialogs";
import { T } from "../translations";

const logger = createLogger("state/ingame");

// Different sub-states
export const GAME_LOADING_STATES = {
    s3_createCore: "s3_createCore",
    s4_A_initEmptyGame: "s4_A_initEmptyGame",
    s4_B_resumeGame: "s4_B_resumeGame",

    s5_firstUpdate: "s5_firstUpdate",
    s6_postLoadHook: "s6_postLoadHook",
    s7_warmup: "s7_warmup",

    s10_gameRunning: "s10_gameRunning",

    leaving: "leaving",
    destroyed: "destroyed",
    initFailed: "initFailed",
};

export const gameCreationAction = {
    new: "new-game",
    resume: "resume-game",
};

// Typehints
export class GameCreationPayload {
    constructor() {
        /** @type {boolean|undefined} */
        this.fastEnter;

        /** @type {string} */
        this.gameModeId;

        /** @type {Savegame} */
        this.savegame;

        /** @type {object|undefined} */
        this.gameModeParameters;
    }
}

export class InGameState extends GameState {
    constructor() {
        super("InGameState");

        /** @type {GameCreationPayload} */
        this.creationPayload = null;

        // Stores current stage
        this.stage = "";

        /** @type {GameCore} */
        this.core = null;

        /** @type {KeyActionMapper} */
        this.keyActionMapper = null;

        /** @type {GameLoadingOverlay} */
        this.loadingOverlay = null;

        /** @type {Savegame} */
        this.savegame = null;

        this.boundInputFilter = this.filterInput.bind(this);

        /**
         * Whether we are currently saving the game
         * @TODO: This doesn't realy fit here
         */
        this.currentSavePromise = null;
    }

    get dialogs() {
        return this.core.root.hud.parts.dialogs;
    }

    /**
     * Switches the game into another sub-state
     * @param {string} stage
     */
    switchStage(stage) {
        assert(stage, "Got empty stage");
        if (stage !== this.stage) {
            this.stage = stage;
            logger.log(this.stage);
            MOD_SIGNALS.gameLoadingStageEntered.dispatch(this, stage);
            return true;
        } else {
            // log(this, "Re entering", stage);
            return false;
        }
    }

    // GameState implementation
    getInnerHTML() {
        return "";
    }

    onAppPause() {
        // if (this.stage === stages.s10_gameRunning) {
        //     logger.log("Saving because app got paused");
        //     this.doSave();
        // }
    }

    getHasFadeIn() {
        return false;
    }

    getPauseOnFocusLost() {
        return false;
    }

    getHasUnloadConfirmation() {
        return true;
    }

    onLeave() {
        if (this.core) {
            this.stageDestroyed();
        }
        this.app.inputMgr.dismountFilter(this.boundInputFilter);
    }

    onResized(w, h) {
        super.onResized(w, h);
        if (this.stage === GAME_LOADING_STATES.s10_gameRunning) {
            this.core.resize(w, h);
        }
    }

    // ---- End of GameState implementation

    /**
     * Goes back to the menu state
     */
    goBackToMenu() {
        if ([enumGameModeIds.puzzleEdit, enumGameModeIds.puzzlePlay].includes(this.gameModeId)) {
            this.saveThenGoToState("PuzzleMenuState");
        } else {
            this.saveThenGoToState("MainMenuState");
        }
    }

    /**
     * Goes back to the settings state
     */
    goToSettings() {
        this.saveThenGoToState("SettingsState", {
            backToStateId: this.key,
            backToStatePayload: this.creationPayload,
        });
    }

    /**
     * Goes back to the settings state
     */
    goToKeybindings() {
        this.saveThenGoToState("KeybindingsState", {
            backToStateId: this.key,
            backToStatePayload: this.creationPayload,
        });
    }

    /**
     * Moves to a state outside of the game
     * @param {string} stateId
     * @param {any=} payload
     */
    saveThenGoToState(stateId, payload) {
        if (this.stage === GAME_LOADING_STATES.leaving || this.stage === GAME_LOADING_STATES.destroyed) {
            logger.warn(
                "Tried to leave game twice or during destroy:",
                this.stage,
                "(attempted to move to",
                stateId,
                ")"
            );
            return;
        }
        this.stageLeavingGame();
        this.doSave().then(() => {
            this.stageDestroyed();
            this.moveToState(stateId, payload);
        });
    }

    onBackButton() {
        // do nothing
    }

    /**
     * Called when the game somehow failed to initialize. Resets everything to basic state and
     * then goes to the main menu, showing the error
     * @param {string} err
     */
    onInitializationFailure(err) {
        if (this.switchStage(GAME_LOADING_STATES.initFailed)) {
            logger.error("Init failure:", err);
            this.stageDestroyed();
            this.moveToState("MainMenuState", { loadError: err });
        }
    }

    // STAGES

    /**
     * Creates the game core instance, and thus the root
     */
    stage3CreateCore() {
        if (this.switchStage(GAME_LOADING_STATES.s3_createCore)) {
            logger.log("Waiting for resources to load");

            this.app.backgroundResourceLoader.resourceStateChangedSignal.add(({ progress }) => {
                this.loadingOverlay.loadingIndicator.innerText = T.global.loadingResources.replace(
                    "<percentage>",
                    (progress * 100.0).toFixed(1)
                );
            });

            this.app.backgroundResourceLoader.getIngamePromise().then(
                () => {
                    if (
                        this.creationPayload.gameModeId &&
                        this.creationPayload.gameModeId.includes("puzzle")
                    ) {
                        this.app.sound.playThemeMusic(MUSIC.puzzle);
                    } else {
                        this.app.sound.playThemeMusic(MUSIC.theme);
                    }

                    this.loadingOverlay.loadingIndicator.innerText = "";
                    this.app.backgroundResourceLoader.resourceStateChangedSignal.removeAll();

                    logger.log("Creating new game core");
                    this.core = new GameCore(this.app);

                    this.core.initializeRoot(this, this.savegame, this.gameModeId);

                    if (this.savegame.hasGameDump()) {
                        this.stage4bResumeGame();
                    } else {
                        this.app.gameAnalytics.handleGameStarted();
                        this.stage4aInitEmptyGame();
                    }
                },
                err => {
                    logger.error("Failed to preload resources:", err);
                    const dialogs = new HUDModalDialogs(null, this.app);
                    const dialogsElement = document.createElement("div");
                    dialogsElement.id = "ingame_HUD_ModalDialogs";
                    dialogsElement.style.zIndex = "999999";
                    document.body.appendChild(dialogsElement);
                    dialogs.initializeToElement(dialogsElement);

                    this.app.backgroundResourceLoader.showLoaderError(dialogs, err);
                }
            );
        }
    }

    /**
     * Initializes a new empty game
     */
    stage4aInitEmptyGame() {
        if (this.switchStage(GAME_LOADING_STATES.s4_A_initEmptyGame)) {
            this.core.initNewGame();
            this.stage5FirstUpdate();
        }
    }

    /**
     * Resumes an existing game
     */
    stage4bResumeGame() {
        if (this.switchStage(GAME_LOADING_STATES.s4_B_resumeGame)) {
            if (!this.core.initExistingGame()) {
                this.onInitializationFailure("Savegame is corrupt and can not be restored.");
                return;
            }
            this.app.gameAnalytics.handleGameResumed();
            this.stage5FirstUpdate();
        }
    }

    /**
     * Performs the first game update on the game which initializes most caches
     */
    stage5FirstUpdate() {
        if (this.switchStage(GAME_LOADING_STATES.s5_firstUpdate)) {
            this.core.root.logicInitialized = true;
            this.core.updateLogic();
            this.stage6PostLoadHook();
        }
    }

    /**
     * Call the post load hook, this means that we have loaded the game, and all systems
     * can operate and start to work now.
     */
    stage6PostLoadHook() {
        if (this.switchStage(GAME_LOADING_STATES.s6_postLoadHook)) {
            logger.log("Post load hook");
            this.core.postLoadHook();
            this.stage7Warmup();
        }
    }

    /**
     * This makes the game idle and draw for a while, because we run most code this way
     * the V8 engine can already start to optimize it. Also this makes sure the resources
     * are in the VRAM and we have a smooth experience once we start.
     */
    stage7Warmup() {
        if (this.switchStage(GAME_LOADING_STATES.s7_warmup)) {
            if (this.creationPayload.fastEnter) {
                this.warmupTimeSeconds = globalConfig.warmupTimeSecondsFast;
            } else {
                this.warmupTimeSeconds = globalConfig.warmupTimeSecondsRegular;
            }
        }
    }

    /**
     * The final stage where this game is running and updating regulary.
     */
    stage10GameRunning() {
        if (this.switchStage(GAME_LOADING_STATES.s10_gameRunning)) {
            this.core.root.signals.readyToRender.dispatch();

            logSection("GAME STARTED", "#26a69a");

            // Initial resize, might have changed during loading (this is possible)
            this.core.resize(this.app.screenWidth, this.app.screenHeight);

            MOD_SIGNALS.gameStarted.dispatch(this.core.root);
        }
    }

    /**
     * This stage destroys the whole game, used to cleanup
     */
    stageDestroyed() {
        if (this.switchStage(GAME_LOADING_STATES.destroyed)) {
            // Cleanup all api calls
            this.cancelAllAsyncOperations();

            if (this.syncer) {
                this.syncer.cancelSync();
                this.syncer = null;
            }

            // Cleanup core
            if (this.core) {
                this.core.destruct();
                this.core = null;
            }
        }
    }

    /**
     * When leaving the game
     */
    stageLeavingGame() {
        if (this.switchStage(GAME_LOADING_STATES.leaving)) {
            // ...
        }
    }

    // END STAGES

    /**
     * Filters the input (keybindings)
     */
    filterInput() {
        return this.stage === GAME_LOADING_STATES.s10_gameRunning;
    }

    /**
     * @param {GameCreationPayload} payload
     */
    onEnter(payload) {
        this.app.inputMgr.installFilter(this.boundInputFilter);

        this.creationPayload = payload;
        this.savegame = payload.savegame;
        this.gameModeId = payload.gameModeId;

        this.loadingOverlay = new GameLoadingOverlay(this.app, this.getDivElement());
        this.loadingOverlay.showBasic();

        // Remove unneded default element
        document.body.querySelector(".modalDialogParent").remove();

        this.asyncChannel
            .watch(waitNextFrame())
            .then(() => this.stage3CreateCore())
            .catch(ex => {
                logger.error(ex);
                throw ex;
            });
    }

    /**
     * Render callback
     * @param {number} dt
     */
    onRender(dt) {
        if (window.APP_ERROR_OCCURED) {
            // Application somehow crashed, do not do anything
            return;
        }

        if (this.stage === GAME_LOADING_STATES.s7_warmup) {
            this.core.draw();
            this.warmupTimeSeconds -= dt / 1000.0;
            if (this.warmupTimeSeconds < 0) {
                logger.log("Warmup completed");
                this.stage10GameRunning();
            }
        }

        if (this.stage === GAME_LOADING_STATES.s10_gameRunning) {
            this.core.tick(dt);
        }

        // If the stage is still active (This might not be the case if tick() moved us to game over)
        if (this.stage === GAME_LOADING_STATES.s10_gameRunning) {
            // Only draw if page visible
            if (this.app.pageVisible) {
                this.core.draw();
            }

            this.loadingOverlay.removeIfAttached();
        } else {
            if (!this.loadingOverlay.isAttached()) {
                this.loadingOverlay.showBasic();
            }
        }
    }

    onBackgroundTick(dt) {
        this.onRender(dt);
    }

    /**
     * Saves the game
     */

    doSave() {
        if (!this.savegame || !this.savegame.isSaveable()) {
            return Promise.resolve();
        }

        if (window.APP_ERROR_OCCURED) {
            logger.warn("skipping save because application crashed");
            return Promise.resolve();
        }

        if (
            this.stage !== GAME_LOADING_STATES.s10_gameRunning &&
            this.stage !== GAME_LOADING_STATES.s7_warmup &&
            this.stage !== GAME_LOADING_STATES.leaving
        ) {
            logger.warn("Skipping save because game is not ready");
            return Promise.resolve();
        }

        if (this.currentSavePromise) {
            logger.warn("Skipping double save and returning same promise");
            return this.currentSavePromise;
        }

        if (!this.core.root.gameMode.getIsSaveable()) {
            return Promise.resolve();
        }

        logger.log("Starting to save game ...");
        this.savegame.updateData(this.core.root);

        this.currentSavePromise = this.savegame
            .writeSavegameAndMetadata()
            .catch(err => {
                // Catch errors
                logger.warn("Failed to save:", err);
            })
            .then(() => {
                // Clear promise
                logger.log("Saved!");
                this.core.root.signals.gameSaved.dispatch();
                this.currentSavePromise = null;
            });

        return this.currentSavePromise;
    }
}
