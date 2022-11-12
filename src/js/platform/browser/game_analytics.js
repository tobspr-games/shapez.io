import { globalConfig } from "../../core/config";
import { createLogger } from "../../core/logging";
import { queryParamOptions } from "../../core/query_parameters";
import { randomInt } from "../../core/utils";
import { BeltComponent } from "../../game/components/belt";
import { StaticMapEntityComponent } from "../../game/components/static_map_entity";
import { RegularGameMode } from "../../game/modes/regular";
import { GameRoot } from "../../game/root";
import { InGameState } from "../../states/ingame";
import { SteamAchievementProvider } from "../electron/steam_achievement_provider";
import { GameAnalyticsInterface } from "../game_analytics";
import { FILE_NOT_FOUND } from "../storage";
import { WEB_STEAM_SSO_AUTHENTICATED } from "../../core/steam_sso";

const logger = createLogger("game_analytics");

const analyticsUrl = G_IS_DEV ? "http://localhost:8001" : "https://analytics.shapez.io";

// Be sure to increment the ID whenever it changes
const analyticsLocalFile = "shapez_token_123.bin";

const CURRENT_ABT = "abt_bsl2";
const CURRENT_ABT_COUNT = 1;

export class ShapezGameAnalytics extends GameAnalyticsInterface {
    constructor(app) {
        super(app);
        this.abtVariant = "0";
    }

    get environment() {
        if (G_IS_DEV) {
            return "dev";
        }

        if (G_IS_STANDALONE) {
            return "steam";
        }

        if (WEB_STEAM_SSO_AUTHENTICATED) {
            return "prod-full";
        }

        if (G_IS_RELEASE) {
            return "prod";
        }

        if (window.location.host.indexOf("alpha") >= 0) {
            return "alpha";
        } else {
            return "beta";
        }
    }

    fetchABVariant() {
        return this.app.storage.readFileAsync("shapez_" + CURRENT_ABT + ".bin").then(
            abt => {
                if (typeof queryParamOptions.abtVariant === "string") {
                    this.abtVariant = queryParamOptions.abtVariant;
                    logger.log("Set", CURRENT_ABT, "to (OVERRIDE) ", this.abtVariant);
                } else {
                    this.abtVariant = abt;
                    logger.log("Read abtVariant:", abt);
                }
            },
            err => {
                if (err === FILE_NOT_FOUND) {
                    if (typeof queryParamOptions.abtVariant === "string") {
                        this.abtVariant = queryParamOptions.abtVariant;
                        logger.log("Set", CURRENT_ABT, "to (OVERRIDE) ", this.abtVariant);
                    } else {
                        this.abtVariant = String(randomInt(0, CURRENT_ABT_COUNT - 1));
                        logger.log("Set", CURRENT_ABT, "to", this.abtVariant);
                    }
                    this.app.storage.writeFileAsync("shapez_" + CURRENT_ABT + ".bin", this.abtVariant);
                }
            }
        );
    }

    note(action) {
        if (this.app.restrictionMgr.isLimitedVersion()) {
            fetch(
                "https://analytics.shapez.io/campaign/" +
                    "action_" +
                    this.environment +
                    "_" +
                    action +
                    "_" +
                    CURRENT_ABT +
                    "_" +
                    this.abtVariant +
                    "?lpurl=nocontent",
                {
                    method: "GET",
                    mode: "no-cors",
                    cache: "no-cache",
                    referrer: "no-referrer",
                    credentials: "omit",
                }
            ).catch(err => {});
        }
    }

    noteMinor(action, payload = "") {}

    /**
     * @returns {Promise<void>}
     */
    initialize() {
        this.syncKey = null;

        window.setAbt = abt => {
            this.app.storage.writeFileAsync("shapez_" + CURRENT_ABT + ".bin", String(abt));
            window.location.reload();
        };

        // Retrieve sync key from player
        return this.fetchABVariant().then(() => {
            setInterval(() => this.sendTimePoints(), 60 * 1000);

            if (this.app.restrictionMgr.isLimitedVersion() && !G_IS_DEV) {
                fetch(
                    "https://analytics.shapez.io/campaign/" +
                        this.environment +
                        "_" +
                        CURRENT_ABT +
                        "_" +
                        this.abtVariant +
                        "?lpurl=nocontent",
                    {
                        method: "GET",
                        mode: "no-cors",
                        cache: "no-cache",
                        referrer: "no-referrer",
                        credentials: "omit",
                    }
                ).catch(err => {});
            }

            return this.app.storage.readFileAsync(analyticsLocalFile).then(
                syncKey => {
                    this.syncKey = syncKey;
                    logger.log("Player sync key read:", this.syncKey);
                },
                error => {
                    // File was not found, retrieve new key
                    if (error === FILE_NOT_FOUND) {
                        logger.log("Retrieving new player key");

                        let authTicket = Promise.resolve(undefined);

                        if (G_IS_STANDALONE) {
                            logger.log("Will retrieve auth ticket");
                            authTicket = ipcRenderer.invoke("steam:get-ticket");
                        }

                        authTicket
                            .then(
                                ticket => {
                                    logger.log("Got ticket:", ticket);

                                    // Perform call to get a new key from the API
                                    return this.sendToApi("/v1/register", {
                                        environment: this.environment,
                                        standalone:
                                            G_IS_STANDALONE &&
                                            this.app.achievementProvider instanceof SteamAchievementProvider,
                                        commit: G_BUILD_COMMIT_HASH,
                                        ticket,
                                    });
                                },
                                err => {
                                    logger.warn("Failed to get steam auth ticket for register:", err);
                                }
                            )
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
        });
    }

    /**
     * Makes sure a DLC is activated on steam
     * @param {string} dlc
     */
    activateDlc(dlc) {
        logger.log("Activating dlc:", dlc);
        return this.sendToApi("/v1/activate-dlc/" + dlc, {});
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
        if (G_IS_DEV) {
            return;
        }

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

        if (!(root.gameMode instanceof RegularGameMode)) {
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
        }).catch(err => {
            console.warn("Request failed", err);
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
     * @param {GameRoot} root
     * @param {string} key
     */
    isInterestingShape(root, key) {
        if (key === root.gameMode.getBlueprintShapeKey()) {
            return true;
        }

        // Check if its a story goal
        const levels = root.gameMode.getLevelDefinitions();
        for (let i = 0; i < levels.length; ++i) {
            if (key === levels[i].shape) {
                return true;
            }
        }

        // Check if its required to unlock an upgrade
        const upgrades = root.gameMode.getUpgrades();
        for (const upgradeKey in upgrades) {
            const upgradeTiers = upgrades[upgradeKey];
            for (let i = 0; i < upgradeTiers.length; ++i) {
                const tier = upgradeTiers[i];
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
        const shapeIds = Object.keys(root.hubGoals.storedShapes).filter(key =>
            this.isInterestingShape(root, key)
        );
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
