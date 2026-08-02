import { createLogger } from "../core/logging";
import { gMetaBuildingRegistry } from "../core/global_registries";
import { globalConfig } from "../core/config";
import { Vector } from "../core/vector";
import { StaticMapEntityComponent } from "../game/components/static_map_entity";
import { defaultBuildingVariant } from "../game/meta_building";
import { GAME_LOADING_STATES, InGameState } from "../states/ingame";

const logger = createLogger("rl/endpoint");
const validBuildingRotations = [0, 90, 180, 270];

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

function getVariantCombinations(building) {
    return building.constructor.getAllVariantCombinations().map(combination => ({
        variant: combination.variant || defaultBuildingVariant,
        rotationVariant: combination.rotationVariant || 0,
    }));
}

function isValidVariantCombination(building, variant, rotationVariant) {
    return getVariantCombinations(building).some(
        combination =>
            combination.variant === variant && combination.rotationVariant === rotationVariant
    );
}

function isValidMapBounds(bounds) {
    return (
        bounds &&
        Number.isSafeInteger(bounds.x) &&
        Number.isSafeInteger(bounds.y) &&
        Number.isSafeInteger(bounds.w) &&
        Number.isSafeInteger(bounds.h) &&
        bounds.w > 0 &&
        bounds.h > 0
    );
}

function serializeMapEntity(entity) {
    const staticComp = entity.components.StaticMapEntity;
    const tileSize = staticComp.getTileSize();
    const bounds = staticComp.getTileSpaceBounds();

    return {
        uid: entity.uid,
        layer: entity.layer,
        id: staticComp.getMetaBuilding().getId(),
        code: staticComp.code,
        x: staticComp.origin.x,
        y: staticComp.origin.y,
        rotation: staticComp.rotation,
        originalRotation: staticComp.originalRotation,
        variant: staticComp.getVariant(),
        rotationVariant: staticComp.getRotationVariant(),
        tileSize: {
            x: tileSize.x,
            y: tileSize.y,
        },
        bounds: {
            x: bounds.x,
            y: bounds.y,
            w: bounds.w,
            h: bounds.h,
        },
    };
}

/**
 * @param {InGameState} state
 * @param {{ x: number, y: number, w: number, h: number }} bounds
 */
function serializeMapWindow(state, bounds) {
    const root = state.core.root;
    const resources = [];
    const buildings = [];
    const seenEntityUids = new Set();
    const endX = bounds.x + bounds.w;
    const endY = bounds.y + bounds.h;

    for (let x = bounds.x; x < endX; ++x) {
        for (let y = bounds.y; y < endY; ++y) {
            const resource = root.map.getLowerLayerContentXY(x, y);
            if (resource) {
                resources.push({
                    x,
                    y,
                    type: resource.getItemType(),
                    key: resource.getAsCopyableKey(),
                });
            }

            const entities = root.map.getLayersContentsMultipleXY(x, y);
            for (let i = 0; i < entities.length; ++i) {
                const entity = entities[i];
                if (
                    !entity ||
                    !entity.components.StaticMapEntity ||
                    entity.destroyed ||
                    entity.queuedForDestroy ||
                    seenEntityUids.has(entity.uid)
                ) {
                    continue;
                }

                seenEntityUids.add(entity.uid);
                buildings.push(serializeMapEntity(entity));
            }
        }
    }

    return {
        ok: true,
        body: {
            state: state.stage,
            gameTime: root.time.now(),
            mapSeed: root.map.seed,
            bounds,
            resources,
            buildings,
        },
    };
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
    if (app.rlHeadless) {
        globalConfig.debug.disableUnlockDialog = true;
        globalConfig.debug.allBuildingsUnlocked = true;
    }

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

    ipc.on("rl:get-map", (_event, payload) => {
        const requestId = payload && payload.requestId;
        try {
            const runningGame = getHeadlessRunningGameState(app);
            if (runningGame.error) {
                sendRlError(ipc, "rl:map-response", requestId, runningGame.error);
                return;
            }

            const bounds = payload && payload.bounds;
            if (!isValidMapBounds(bounds)) {
                sendRlError(ipc, "rl:map-response", requestId, {
                    status: 400,
                    error: "invalid-map-bounds",
                });
                return;
            }

            ipc.send("rl:map-response", {
                requestId,
                ...serializeMapWindow(runningGame.state, bounds),
            });
        } catch (ex) {
            logger.warn("Failed to serialize RL map:", ex);
            ipc.send("rl:map-response", {
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

    ipc.on("rl:place-building", (_event, payload) => {
        const requestId = payload && payload.requestId;
        try {
            const runningGame = getHeadlessRunningGameState(app);
            if (runningGame.error) {
                sendRlError(ipc, "rl:place-building-response", requestId, runningGame.error);
                return;
            }

            const state = runningGame.state;
            const root = state.core.root;
            const buildingPayload = payload && payload.building;
            const id = buildingPayload && buildingPayload.id;
            if (typeof id !== "string" || !gMetaBuildingRegistry.hasId(id)) {
                sendRlError(ipc, "rl:place-building-response", requestId, {
                    status: 400,
                    error: "invalid-building-id",
                });
                return;
            }

            const building = gMetaBuildingRegistry.findById(id);
            if (root.gameMode.isBuildingExcluded(building.constructor)) {
                sendRlError(ipc, "rl:place-building-response", requestId, {
                    status: 403,
                    error: "building-excluded",
                });
                return;
            }
            if (!building.getIsUnlocked(root)) {
                sendRlError(ipc, "rl:place-building-response", requestId, {
                    status: 403,
                    error: "building-locked",
                });
                return;
            }

            const x = buildingPayload && buildingPayload.x;
            const y = buildingPayload && buildingPayload.y;
            if (!Number.isInteger(x) || !Number.isInteger(y)) {
                sendRlError(ipc, "rl:place-building-response", requestId, {
                    status: 400,
                    error: "invalid-tile",
                });
                return;
            }

            const rotation = buildingPayload.rotation === undefined ? 0 : buildingPayload.rotation;
            if (!validBuildingRotations.includes(rotation)) {
                sendRlError(ipc, "rl:place-building-response", requestId, {
                    status: 400,
                    error: "invalid-rotation",
                });
                return;
            }

            const variant = buildingPayload.variant || defaultBuildingVariant;
            if (
                typeof variant !== "string" ||
                !building.getAvailableVariants(root).includes(variant)
            ) {
                sendRlError(ipc, "rl:place-building-response", requestId, {
                    status: 400,
                    error: "invalid-variant",
                });
                return;
            }

            const origin = new Vector(x, y);
            const requestedRotationVariant = buildingPayload.rotationVariant;
            let placementRotation = rotation;
            let rotationVariant = requestedRotationVariant;
            if (requestedRotationVariant === undefined || requestedRotationVariant === null) {
                const computed = building.computeOptimalDirectionAndRotationVariantAtTile({
                    root,
                    tile: origin,
                    rotation,
                    variant,
                    layer: building.getLayer(),
                });
                placementRotation = computed.rotation;
                rotationVariant = computed.rotationVariant;
            }

            if (
                !Number.isInteger(rotationVariant) ||
                !validBuildingRotations.includes(placementRotation) ||
                !isValidVariantCombination(building, variant, rotationVariant)
            ) {
                sendRlError(ipc, "rl:place-building-response", requestId, {
                    status: 400,
                    error: "invalid-rotation-variant",
                });
                return;
            }

            const entity = root.logic.tryPlaceBuilding({
                origin,
                rotation: placementRotation,
                rotationVariant,
                originalRotation: rotation,
                building,
                variant,
            });
            if (!entity) {
                sendRlError(ipc, "rl:place-building-response", requestId, {
                    status: 409,
                    error: "placement-blocked",
                });
                return;
            }

            root.signals.entityManuallyPlaced.dispatch(entity);
            root.productionAnalytics.update();
            root.achievementProxy.update();
            root.automaticSave.update();

            ipc.send("rl:place-building-response", {
                requestId,
                ...serializeGameState(state, 0, {
                    placed: true,
                    entityUid: entity.uid,
                    building: {
                        id,
                        x,
                        y,
                        rotation: placementRotation,
                        originalRotation: rotation,
                        variant,
                        rotationVariant,
                    },
                }),
            });
        } catch (ex) {
            logger.warn("Failed to place RL building:", ex);
            ipc.send("rl:place-building-response", {
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
