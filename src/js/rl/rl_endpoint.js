import { createLogger } from "../core/logging";
import { StaticMapEntityComponent } from "../game/components/static_map_entity";
import { GAME_LOADING_STATES, InGameState } from "../states/ingame";

const logger = createLogger("rl/endpoint");

/**
 * @param {import("../application").Application} app
 * @returns {InGameState|null}
 */
function getRunningGameState(app) {
    const state = app.stateMgr && app.stateMgr.getCurrentState();
    if (!(state instanceof InGameState)) {
        return null;
    }
    if (state.stage !== GAME_LOADING_STATES.s10_gameRunning || !state.core || !state.core.root) {
        return null;
    }
    return state;
}

/**
 * @param {import("../application").Application} app
 * @returns {{ state: InGameState, error: null } | { state: null, error: { status: number, error: string } }}
 */
function getHeadlessRunningGameState(app) {
    if (!app.rlHeadless) {
        return {
            state: null,
            error: {
                status: 409,
                error: "not-headless",
            },
        };
    }

    const state = getRunningGameState(app);
    if (!state) {
        return {
            state: null,
            error: {
                status: 409,
                error: "game-not-running",
            },
        };
    }

    return {
        state,
        error: null,
    };
}

function sendRlError(ipc, responseChannel, requestId, error) {
    ipc.send(responseChannel, {
        requestId,
        ok: false,
        status: error.status,
        error: error.error,
    });
}

/**
 * @param {InGameState} state
 * @param {number=} ticksRun
 * @param {object=} extra
 */
function serializeGameState(state, ticksRun = 0, extra = {}) {
    const root = state.core.root;
    const updateResult = state.savegame.updateData(root);
    if (updateResult === false) {
        return {
            ok: false,
            status: 500,
            error: "serialize-failed",
        };
    }

    return {
        ok: true,
        body: {
            state: state.stage,
            gameTime: root.time.now(),
            ticksRun,
            ...extra,
            savegame: state.savegame.currentData,
        },
    };
}

/**
 * Installs the renderer-side responder for the Electron RL API.
 * @param {import("../application").Application} app
 */
export function initializeRLEndpoint(app) {
    app.rlHeadless = new URLSearchParams(window.location.search).get("rl-headless") === "1";

    // @ts-ignore exposed by electron/preload.js
    const ipc = window.ipcRenderer;
    if (!ipc) {
        return;
    }

    ipc.on("rl:get-game-state", (_event, payload) => {
        const requestId = payload && payload.requestId;
        try {
            const state = app.stateMgr && app.stateMgr.getCurrentState();
            if (!(state instanceof InGameState)) {
                ipc.send("rl:game-state-response", {
                    requestId,
                    ok: false,
                    status: 409,
                    error: "not-ingame",
                });
                return;
            }

            if (!getRunningGameState(app)) {
                ipc.send("rl:game-state-response", {
                    requestId,
                    ok: false,
                    status: 409,
                    error: "game-not-running",
                });
                return;
            }

            ipc.send("rl:game-state-response", {
                requestId,
                ...serializeGameState(state),
            });
        } catch (ex) {
            logger.warn("Failed to serialize RL game state:", ex);
            ipc.send("rl:game-state-response", {
                requestId,
                ok: false,
                status: 500,
                error: "exception",
            });
        }
    });

    ipc.on("rl:tick", (_event, payload) => {
        const requestId = payload && payload.requestId;
        try {
            const runningGame = getHeadlessRunningGameState(app);
            if (runningGame.error) {
                sendRlError(ipc, "rl:tick-response", requestId, runningGame.error);
                return;
            }

            const state = runningGame.state;
            const ticks = payload && payload.ticks;
            const root = state.core.root;
            let ticksRun = 0;

            for (let i = 0; i < ticks; ++i) {
                let tickCompleted = false;

                root.time.updateRealtimeNow();
                root.time.performTicks(root.dynamicTickrate.deltaMs, () => {
                    const updateResult = state.core.updateLogic();
                    if (updateResult) {
                        tickCompleted = true;
                        ++ticksRun;
                    }
                    return updateResult;
                });

                if (!tickCompleted || !state.core || !state.core.root) {
                    break;
                }
            }

            root.productionAnalytics.update();
            root.achievementProxy.update();
            root.automaticSave.update();

            ipc.send("rl:tick-response", {
                requestId,
                ...serializeGameState(state, ticksRun),
            });
        } catch (ex) {
            logger.warn("Failed to tick RL game state:", ex);
            ipc.send("rl:tick-response", {
                requestId,
                ok: false,
                status: 500,
                error: "exception",
            });
        }
    });

    ipc.on("rl:destroy-removable-buildings", (_event, payload) => {
        const requestId = payload && payload.requestId;
        try {
            const runningGame = getHeadlessRunningGameState(app);
            if (runningGame.error) {
                sendRlError(
                    ipc,
                    "rl:destroy-removable-buildings-response",
                    requestId,
                    runningGame.error
                );
                return;
            }

            const state = runningGame.state;
            const root = state.core.root;
            const staticEntities = Array.from(
                root.entityMgr.getAllWithComponent(StaticMapEntityComponent)
            ).filter(entity => !entity.destroyed && !entity.queuedForDestroy);
            const removableEntities = staticEntities.filter(entity => root.logic.canDeleteBuilding(entity));
            let destroyed = 0;
            let skipped = 0;

            root.logic.performBulkOperation(() => {
                for (const entity of removableEntities) {
                    if (root.logic.tryDeleteBuilding(entity)) {
                        ++destroyed;
                    } else {
                        ++skipped;
                    }
                }
            });

            root.productionAnalytics.update();
            root.achievementProxy.update();
            root.automaticSave.update();

            ipc.send("rl:destroy-removable-buildings-response", {
                requestId,
                ...serializeGameState(state, 0, {
                    destroyed,
                    skipped,
                    remainingNonRemovable: staticEntities.length - removableEntities.length,
                }),
            });
        } catch (ex) {
            logger.warn("Failed to destroy RL removable buildings:", ex);
            ipc.send("rl:destroy-removable-buildings-response", {
                requestId,
                ok: false,
                status: 500,
                error: "exception",
            });
        }
    });
}
