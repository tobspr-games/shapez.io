/* typehints:start */
import { Application } from "../../application";
import { GameRoot } from "../../game/root";
/* typehints:end */

import { createLogger } from "../../core/logging";
import { getIPCRenderer } from "../../core/utils";
import { ACHIEVEMENTS, AchievementCollection, AchievementProviderInterface } from "../achievement_provider";

const logger = createLogger("achievements/steam");

const ACHIEVEMENT_IDS = {
    [ACHIEVEMENTS.belt500Tiles]: "belt_500_tiles",
    [ACHIEVEMENTS.blueprint100k]: "blueprint_100k",
    [ACHIEVEMENTS.blueprint1m]: "blueprint_1m",
    [ACHIEVEMENTS.completeLvl26]: "complete_lvl_26",
    [ACHIEVEMENTS.cutShape]: "cut_shape",
    [ACHIEVEMENTS.darkMode]: "dark_mode",
    [ACHIEVEMENTS.level100]: "level_100",
    [ACHIEVEMENTS.level50]: "level_50",
    [ACHIEVEMENTS.paintShape]: "paint_shape",
    [ACHIEVEMENTS.place5000Wires]: "place_5000_wires",
    [ACHIEVEMENTS.placeBlueprint]: "place_blueprint",
    [ACHIEVEMENTS.play1h]: "play_1h",
    [ACHIEVEMENTS.play10h]: "play_10h",
    [ACHIEVEMENTS.play20h]: "play_20h",
    [ACHIEVEMENTS.produceLogo]: "produce_logo",
    [ACHIEVEMENTS.produceMsLogo]: "produce_ms_logo",
    [ACHIEVEMENTS.produceRocket]: "produce_rocket",
    [ACHIEVEMENTS.rotateShape]: "rotate_shape",
    [ACHIEVEMENTS.stack4Layers]: "stack_4_layers",
    [ACHIEVEMENTS.stackShape]: "stack_shape",
    [ACHIEVEMENTS.store100Unique]: "store_100_unique",
    [ACHIEVEMENTS.storeShape]: "store_shape",
    [ACHIEVEMENTS.unlockWires]: "unlock_wires",
};

export class SteamAchievementProvider extends AchievementProviderInterface {
    /** @param {Application} app */
    constructor(app) {
        super(app);

        this.initialized = false;
        this.loaded = false;
        this.collection = new AchievementCollection(this.activate.bind(this));

        logger.log("Collection created with", this.collection.map.size, "achievements");
    }

    /** @returns {boolean} */
    hasAchievements() {
        return true;
    }

    /** @returns {boolean} */
    hasLoaded() {
        return this.loaded;
    }

    /**
     * @param {GameRoot} root
     * @returns {Promise<void>}
     */
    onLoad(root) {
        if (this.loaded) {
            return Promise.resolve();
        }

        try {
            this.collection.initialize(root);
            this.loaded = true;
            logger.log(this.collection.map.size, "achievements are relevant and initialized");
            return Promise.resolve();
        } catch (err) {
            logger.error("Failed to initialize the achievement collection");
            return Promise.reject(err);
        }
    }

    /** @returns {Promise<void>} */
    initialize() {
        if (!G_IS_STANDALONE) {
            logger.warn("Steam unavailable. Achievements won't sync.");
            return Promise.resolve();
        }

        this.ipc = getIPCRenderer();

        return this.ipc.invoke("steam:is-initialized")
            .then(initialized => {
                this.initialized = initialized;

                if (!this.initialized) {
                    logger.warn("Steam failed to intialize. Achievements won't sync.");
                } else {
                    logger.log("Steam achievement provider initialized");
                }
            });
    }

    /**
     * @param {string} key
     * @returns {Promise<void>}
     */
    activate(key) {
        let promise;

        if (!this.initialized) {
            promise = Promise.resolve();
        } else {
            promise = this.ipc.invoke("steam:activate-achievement", ACHIEVEMENT_IDS[key]);
        }

        return promise
            .then(() => {
                logger.log("Achievement activated:", key);
            })
            .catch(err => {
                logger.error("Failed to activate achievement:", key, err);
                throw err;
            });
    }
}
