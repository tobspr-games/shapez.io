import { globalConfig } from "../../core/config";
import { createLogger } from "../../core/logging";
import { GameRoot } from "../../game/root";
import { InGameState } from "../../states/ingame";
import { GameAnalyticsInterface } from "../game_analytics";
import { FILE_NOT_FOUND } from "../storage";
import { blueprintShape, UPGRADES } from "../../game/upgrades";
import { tutorialGoals } from "../../game/tutorial_goals";
import { BeltComponent } from "../../game/components/belt";
import { StaticMapEntityComponent } from "../../game/components/static_map_entity";

const logger = createLogger("game_analytics");

const analyticsUrl = G_IS_DEV ? "http://localhost:8001" : "https://analytics.shapez.io";

// Be sure to increment the ID whenever it changes to make sure all
// users are tracked
const analyticsLocalFile = "shapez_token_123.bin";

export class ShapezGameAnalytics extends GameAnalyticsInterface {
    get environment() {
        if (G_IS_DEV) {
            return "dev";
        }

        if (G_IS_STANDALONE) {
            return "steam";
        }

        if (G_IS_RELEASE) {
            return "prod";
        }

        return "beta";
    }

    /**
     * @returns {Promise<void>}
     */
    initialize() {
        this.syncKey = null;

        setInterval(() => this.sendTimePoints(), 60 * 1000);

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
                        environment: this.environment,
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
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject("Request to " + endpoint + " timed out"), 20000);

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
                    clearTimeout(timeout);
                    if (!res.ok || res.status !== 200) {
                        reject("Fetch error: Bad status " + res.status);
                    } else {
                        return res.json();
                    }
                })
                .then(resolve)
                .catch(reason => {
                    clearTimeout(timeout);
                    reject(reason);
                });
        });
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
            environment: this.environment,
            category,
            value,
            version: G_BUILD_VERSION,
            level: root.hubGoals.level,
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
     * Returns true if the shape is interesting
     * @param {string} key
     */
    isInterestingShape(key) {
        if (key === blueprintShape) {
            return true;
        }

        // Check if its a story goal
        for (let i = 0; i < tutorialGoals.length; ++i) {
            if (key === tutorialGoals[i].shape) {
                return true;
            }
        }

        // Check if its required to unlock an upgrade
        for (const upgradeKey in UPGRADES) {
            const handle = UPGRADES[upgradeKey];
            const tiers = handle.tiers;
            for (let i = 0; i < tiers.length; ++i) {
                const tier = tiers[i];
                const required = tier.required;
                for (let k = 0; k < required.length; ++k) {
                    if (required[k].shape === key) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Generates a game dump
     * @param {GameRoot} root
     */
    generateGameDump(root) {
        const shapeIds = Object.keys(root.hubGoals.storedShapes).filter(this.isInterestingShape.bind(this));
        let shapes = {};
        for (let i = 0; i < shapeIds.length; ++i) {
            shapes[shapeIds[i]] = root.hubGoals.storedShapes[shapeIds[i]];
        }
        return {
            shapes,
            upgrades: root.hubGoals.upgradeLevels,
            belts: root.entityMgr.getAllWithComponent(BeltComponent).length,
            buildings:
                root.entityMgr.getAllWithComponent(StaticMapEntityComponent).length -
                root.entityMgr.getAllWithComponent(BeltComponent).length,
        };
    }

    /**
     */
    handleGameStarted() {
        this.sendGameEvent("game_start", "");
    }

    /**
     */
    handleGameResumed() {
        this.sendTimePoints();
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
