import { createLogger } from "../core/logging";
import { GAME_LOADING_STATES, InGameState } from "../states/ingame";

const logger = createLogger("rl/endpoint");

/**
 * Installs the renderer-side responder for the Electron RL API.
 * @param {import("../application").Application} app
 */
export function initializeRLEndpoint(app) {
    // @ts-ignore exposed by electron/preload.js
    const ipc = window.ipcRenderer;
    if (!ipc) {
        return;
    }

    ipc.on("rl:get-game-state", (_event, requestId) => {
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

            if (state.stage !== GAME_LOADING_STATES.s10_gameRunning || !state.core || !state.core.root) {
                ipc.send("rl:game-state-response", {
                    requestId,
                    ok: false,
                    status: 409,
                    error: "game-not-running",
                });
                return;
            }

            const root = state.core.root;
            const updateResult = state.savegame.updateData(root);
            if (updateResult === false) {
                ipc.send("rl:game-state-response", {
                    requestId,
                    ok: false,
                    status: 500,
                    error: "serialize-failed",
                });
                return;
            }

            ipc.send("rl:game-state-response", {
                requestId,
                ok: true,
                body: {
                    state: state.stage,
                    gameTime: root.time.now(),
                    savegame: state.savegame.currentData,
                },
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
}
