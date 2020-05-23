import { GameAnalyticsInterface } from "../game_analytics";
import { createLogger } from "../../core/logging";
import { ShapeDefinition } from "../../game/shape_definition";
import { Savegame } from "../../savegame/savegame";
import { FILE_NOT_FOUND } from "../storage";
import { globalConfig } from "../../core/config";
import { InGameState } from "../../states/ingame";
import { GameRoot } from "../../game/root";
import { StaticMapEntityComponent } from "../../game/components/static_map_entity";

const logger = createLogger("game_analytics");

const analyticsUrl = G_IS_DEV ? "http://localhost:8001" : "https://analytics.shapez.io";

// Be sure to increment the ID whenever it changes to make sure all
// users are tracked
const analyticsLocalFile = "analytics_token.3.bin";

export class ShapezGameAnalytics extends GameAnalyticsInterface {
    /**
     * @returns {Promise<void>}
     */
    initialize() {
        this.syncKey = null;

        setInterval(() => this.sendTimePoints(), 120 * 1000);

        // Retrieve sync key from player
        return this.app.storage.readFileAsync(analyticsLocalFile).then(
            syncKey => {
                this.syncKey = syncKey;
                logger.log("Player sync key read:", this.syncKey);
            },
            error => {
                // File was not found, retrieve new key
                if (error === FILE_NOT_FOUND) {
                    logger.log("Retrieving new player key");

                    // Perform call to get a new key from the API
                    this.sendToApi("/v1/register", {
                        environment: G_APP_ENVIRONMENT,
                    })
                        .then(res => {
                            // Try to read and parse the key from the api
                            if (res.key && typeof res.key === "string" && res.key.length === 40) {
                                this.syncKey = res.key;
                                logger.log("Key retrieved:", this.syncKey);
                                this.app.storage.writeFileAsync(analyticsLocalFile, res.key);
                            } else {
                                throw new Error("Bad response from analytics server: " + res);
                            }
                        })
                        .catch(err => {
                            logger.error("Failed to register on analytics api:", err);
                        });
                } else {
                    logger.error("Failed to read ga key:", error);
                }
                return;
            }
        );
    }

    /**
     * Sends a request to the api
     * @param {string} endpoint Endpoint without base url
     * @param {object} data payload
     * @returns {Promise<any>}
     */
    sendToApi(endpoint, data) {
        return Promise.race([
            new Promise((resolve, reject) => {
                setTimeout(() => reject("Request to " + endpoint + " timed out"), 20000);
            }),
            fetch(analyticsUrl + endpoint, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                referrer: "no-referrer",
                credentials: "omit",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "x-api-key": globalConfig.info.analyticsApiKey,
                },
                body: JSON.stringify(data),
            })
                .then(res => {
                    if (!res.ok || res.status !== 200) {
                        throw new Error("Fetch error: Bad status " + res.status);
                    }
                    return res;
                })
                .then(res => res.json()),
        ]);
    }

    /**
     * Sends a game event to the analytics
     * @param {string} category
     * @param {string} value
     */
    sendGameEvent(category, value) {
        if (!this.syncKey) {
            logger.warn("Can not send event due to missing sync key");
            return;
        }

        const gameState = this.app.stateMgr.currentState;
        if (!(gameState instanceof InGameState)) {
            logger.warn("Trying to send analytics event outside of ingame state");
            return;
        }

        const savegame = gameState.savegame;
        if (!savegame) {
            logger.warn("Ingame state has empty savegame");
            return;
        }

        const savegameId = savegame.internalId;
        if (!gameState.core) {
            logger.warn("Game state has no core");
            return;
        }
        const root = gameState.core.root;
        if (!root) {
            logger.warn("Root is not initialized");
            return;
        }

        logger.log("Sending event", category, value);

        this.sendToApi("/v1/game-event", {
            playerKey: this.syncKey,
            gameKey: savegameId,
            ingameTime: root.time.now(),
            category,
            value,
            gameDump: this.generateGameDump(root),
        });
    }

    sendTimePoints() {
        const gameState = this.app.stateMgr.currentState;
        if (gameState instanceof InGameState) {
            logger.log("Syncing analytics");
            this.sendGameEvent("sync", "");
        }
    }

    /**
     * Generates a game dump
     * @param {GameRoot} root
     */
    generateGameDump(root) {
        let staticEntities = [];

        const entities = root.entityMgr.getAllWithComponent(StaticMapEntityComponent);

        // Limit the entities
        if (entities.length < 5000) {
            for (let i = 0; i < entities.length; ++i) {
                const entity = entities[i];
                const staticComp = entity.components.StaticMapEntity;
                const payload = {};
                payload.origin = staticComp.origin;
                payload.tileSize = staticComp.tileSize;
                payload.rotation = staticComp.rotation;

                if (entity.components.Belt) {
                    payload.type = "belt";
                } else if (entity.components.UndergroundBelt) {
                    payload.type = "tunnel";
                } else if (entity.components.ItemProcessor) {
                    payload.type = entity.components.ItemProcessor.type;
                } else if (entity.components.Miner) {
                    payload.type = "extractor";
                } else {
                    logger.warn("Unkown entity type", entity);
                }
                staticEntities.push(payload);
            }
        }

        return {
            storedShapes: root.hubGoals.storedShapes,
            gainedRewards: root.hubGoals.gainedRewards,
            upgradeLevels: root.hubGoals.upgradeLevels,
            staticEntities,
        };
    }

    /**
     * @param {ShapeDefinition} definition
     */
    handleShapeDelivered(definition) {}

    /**
     */
    handleGameStarted() {
        this.sendGameEvent("game_start", "");
    }

    /**
     * Handles the given level completed
     * @param {number} level
     */
    handleLevelCompleted(level) {
        logger.log("Complete level", level);
        this.sendGameEvent("level_complete", "" + level);
    }

    /**
     * Handles the given upgrade completed
     * @param {string} id
     * @param {number} level
     */
    handleUpgradeUnlocked(id, level) {
        logger.log("Unlock upgrade", id, level);
        this.sendGameEvent("upgrade_unlock", id + "@" + level);
    }
}
