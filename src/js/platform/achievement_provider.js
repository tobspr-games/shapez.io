/* typehints:start */
import { Application } from "../application";
import { BaseItem } from "./base_item";
import { StorageComponent } from "../game/components/storage";
import { Entity } from "../game/entity";
import { GameRoot } from "../game/root";
import { ShapeDefinition } from "../game/shape_definition";
/* typehints:end */

import { enumAnalyticsDataSource } from "../game/production_analytics";

export const ACHIEVEMENTS = {
    belt500Tiles: "belt500Tiles",
    blueprint100k: "blueprint100k",
    blueprint1m: "blueprint1m",
    completeLvl26: "completeLvl26",
    cutShape: "cutShape",
    darkMode: "darkMode",
    destroy1000: "destroy1000",
    irrelevantShape: "irrelevantShape",
    level100: "level100",
    level50: "level50",
    logoBefore18: "logoBefore18",
    mapMarkers15: "mapMarkers15",
    oldLevel17: "oldLevel17",
    openWires: "openWires",
    paintShape: "paintShape",
    place5000Wires: "place5000Wires",
    placeBlueprint: "placeBlueprint",
    placeBp1000: "placeBp1000",
    play1h: "play1h",
    play10h: "play10h",
    play20h: "play20h",
    produceLogo: "produceLogo",
    produceMsLogo: "produceMsLogo",
    produceRocket: "produceRocket",
    rotateShape: "rotateShape",
    speedrunBp30: "speedrunBp30",
    speedrunBp60: "speedrunBp60",
    speedrunBp120: "speedrunBp120",
    stack4Layers: "stack4Layers",
    stackShape: "stackShape",
    store100Unique: "store100Unique",
    storeShape: "storeShape",
    throughputBp25: "throughputBp25",
    throughputBp50: "throughputBp50",
    throughputLogo25: "throughputLogo25",
    throughputLogo50: "throughputLogo50",
    throughputRocket10: "throughputRocket10",
    throughputRocket20: "throughputRocket20",
    trash1000: "trash1000",
    unlockWires: "unlockWires",
    upgradesTier5: "upgradesTier5",
    upgradesTier8: "upgradesTier8",
};

const DARK_MODE = "dark";
const HOUR_1 = 3600; // Seconds
const HOUR_10 = HOUR_1 * 10;
const HOUR_20 = HOUR_1 * 20;
const ITEM_SHAPE = "shape";
const MINUTE_30 = 1800; // Seconds
const MINUTE_60 = MINUTE_30 * 2;
const MINUTE_120 = MINUTE_30 * 4;
const PRODUCED = "produced";
const RATE_SLICE_COUNT = 10;
const SHAPE_BP = "CbCbCbRb:CwCwCwCw";
const SHAPE_LOGO = "RuCw--Cw:----Ru--";
const SHAPE_MS_LOGO = "RgRyRbRr";
const SHAPE_ROCKET = "CbCuCbCu:Sr------:--CrSrCr:CwCwCwCw";
const SHAPE_OLD_LEVEL_17 = "WrRgWrRg:CwCrCwCr:SgSgSgSg";
const WIRE_LAYER = "wires";

export class AchievementProviderInterface {
    /** @param {Application} app */
    constructor(app) {
        this.app = app;
    }

    /**
     * Initializes the achievement provider.
     * @returns {Promise<void>}
     */
    initialize() {
        abstract;
        return Promise.reject();
    }

    /**
     * Opportunity to do additional initialization work with the GameRoot.
     * @param {GameRoot} root
     * @returns {Promise<void>}
     */
    onLoad(root) {
        abstract;
        return Promise.reject();
    }

    /** @returns {boolean} */
    hasLoaded() {
        abstract;
        return false;
    }

    /**
     * Call to activate an achievement with the provider
     * @param {string} key - Maps to an Achievement
     * @returns {Promise<void>}
     */
    activate(key) {
        abstract;
        return Promise.reject();
    }

    /**
     * Checks if achievements are supported in the current build
     * @returns {boolean}
     */
    hasAchievements() {
        abstract;
        return false;
    }
}

export class Achievement {
    /** @param {string} key - An ACHIEVEMENTS key */
    constructor(key) {
        this.key = key;
        this.activate = null;
        this.activatePromise = null;
        this.receiver = null;
        this.signal = null;
    }

    isValid() {
        return true;
    }

    isRelevant() {
        return true;
    }

    unlock() {
        if (!this.activatePromise) {
            this.activatePromise = this.activate(this.key);
        }

        return this.activatePromise;
    }
}

export class AchievementCollection {
    /**
     * @param {function} activate - Resolves when provider activation is complete
     */
    constructor(activate) {
        this.map = new Map();
        this.activate = activate;

        this.createAndSet(ACHIEVEMENTS.belt500Tiles, {
            isValid: this.isBelt500TilesValid,
            signal: "entityAdded",
        });
        this.createAndSet(ACHIEVEMENTS.blueprint100k, {
            isValid: this.isBlueprint100kValid,
            signal: "shapeDelivered",
        });
        this.createAndSet(ACHIEVEMENTS.blueprint1m, {
            isValid: this.isBlueprint1mValid,
            signal: "shapeDelivered",
        });
        this.createAndSet(ACHIEVEMENTS.completeLvl26, this.createLevelOptions(26));
        this.createAndSet(ACHIEVEMENTS.cutShape);
        this.createAndSet(ACHIEVEMENTS.darkMode, {
            isValid: this.isDarkModeValid,
        });
        this.createAndSet(ACHIEVEMENTS.destroy1000, {
            isValid: this.isDestroy1000Valid,
        });
        this.createAndSet(ACHIEVEMENTS.irrelevantShape, {
            isValid: this.isIrrelevantShapeValid,
            signal: "shapeDelivered",
        });
        this.createAndSet(ACHIEVEMENTS.level100, this.createLevelOptions(100));
        this.createAndSet(ACHIEVEMENTS.level50, this.createLevelOptions(50));
        this.createAndSet(ACHIEVEMENTS.logoBefore18, {
            isRelevant: this.isLogoBefore18Relevant,
            isValid: this.isLogoBefore18Valid,
            signal: "itemProduced"
        });
        this.createAndSet(ACHIEVEMENTS.mapMarkers15, {
            isRelevant: this.isMapMarkers15Relevant,
            isValid: this.isMapMarkers15Valid,
        });
        this.createAndSet(ACHIEVEMENTS.oldLevel17, this.createShapeOptions(SHAPE_OLD_LEVEL_17));
        this.createAndSet(ACHIEVEMENTS.openWires, {
            isValid: this.isOpenWiresValid,
            signal: "editModeChanged",
        });
        this.createAndSet(ACHIEVEMENTS.paintShape);
        this.createAndSet(ACHIEVEMENTS.place5000Wires, {
            isValid: this.isPlace5000WiresValid,
        });
        this.createAndSet(ACHIEVEMENTS.placeBlueprint, {
            isValid: this.isPlaceBlueprintValid,
        });
        this.createAndSet(ACHIEVEMENTS.placeBp1000, {
            isValid: this.isPlaceBp1000Valid,
        });
        this.createAndSet(ACHIEVEMENTS.play1h, this.createTimeOptions(HOUR_1));
        this.createAndSet(ACHIEVEMENTS.play10h, this.createTimeOptions(HOUR_10));
        this.createAndSet(ACHIEVEMENTS.play20h, this.createTimeOptions(HOUR_20));
        this.createAndSet(ACHIEVEMENTS.produceLogo, this.createShapeOptions(SHAPE_LOGO));
        this.createAndSet(ACHIEVEMENTS.produceRocket, this.createShapeOptions(SHAPE_ROCKET));
        this.createAndSet(ACHIEVEMENTS.produceMsLogo, this.createShapeOptions(SHAPE_MS_LOGO));
        this.createAndSet(ACHIEVEMENTS.rotateShape);
        this.createAndSet(ACHIEVEMENTS.speedrunBp30, this.createSpeedOptions(12, MINUTE_30));
        this.createAndSet(ACHIEVEMENTS.speedrunBp60, this.createSpeedOptions(12, MINUTE_60));
        this.createAndSet(ACHIEVEMENTS.speedrunBp120, this.createSpeedOptions(12, MINUTE_120));
        this.createAndSet(ACHIEVEMENTS.stack4Layers, {
            isValid: this.isStack4LayersValid,
            signal: "itemProduced",
        });
        this.createAndSet(ACHIEVEMENTS.stackShape);
        this.createAndSet(ACHIEVEMENTS.store100Unique, {
            isRelevant: this.isStore100UniqueRelevant,
            isValid: this.isStore100UniqueValid,
            signal: "shapeDelivered",
        });
        this.createAndSet(ACHIEVEMENTS.storeShape, {
            isValid: this.isStoreShapeValid,
        });
        this.createAndSet(ACHIEVEMENTS.throughputBp25, this.createRateOptions(SHAPE_BP, 25));
        this.createAndSet(ACHIEVEMENTS.throughputBp50, this.createRateOptions(SHAPE_BP, 50));
        this.createAndSet(ACHIEVEMENTS.throughputLogo25, this.createRateOptions(SHAPE_LOGO, 25));
        this.createAndSet(ACHIEVEMENTS.throughputLogo50, this.createRateOptions(SHAPE_LOGO, 50));
        this.createAndSet(ACHIEVEMENTS.throughputRocket10, this.createRateOptions(SHAPE_ROCKET, 25));
        this.createAndSet(ACHIEVEMENTS.throughputRocket20, this.createRateOptions(SHAPE_ROCKET, 50));
        this.createAndSet(ACHIEVEMENTS.trash1000, {
            init: this.initTrash1000,
            isValid: this.isTrash1000Valid,
        });
        this.createAndSet(ACHIEVEMENTS.unlockWires, this.createLevelOptions(20));
        this.createAndSet(ACHIEVEMENTS.upgradesTier5, this.createUpgradeOptions(5));
        this.createAndSet(ACHIEVEMENTS.upgradesTier8, this.createUpgradeOptions(8));
    }

    /** @param {GameRoot} root */
    initialize(root) {
        this.root = root;
        this.root.signals.achievementCheck.add(this.unlock, this);
        this.root.signals.bulkAchievementCheck.add(this.bulkUnlock, this);

        for (let [key, achievement] of this.map.entries()) {
            if (achievement.init) {
                achievement.init();
            }

            if (!achievement.isRelevant()) {
                this.remove(key);
                continue;
            }

            if (achievement.signal) {
                achievement.receiver = this.unlock.bind(this, key);
                this.root.signals[achievement.signal].add(achievement.receiver);
            }
        }

        if (!this.hasDefaultReceivers()) {
            this.root.signals.achievementCheck.remove(this.unlock);
        }
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @param {object} [options]
     * @param {function} [options.isValid]
     * @param {function} [options.isRelevant]
     * @param {string} [options.signal]
     */
    createAndSet(key, options = {}) {
        if (G_IS_DEV) {
            assert(ACHIEVEMENTS[key], "Achievement key not found: ", key);
        }

        const achievement = new Achievement(key);

        achievement.activate = this.activate;

        if (options.init) {
            achievement.init = options.init.bind(this, achievement);
        }

        if (options.isValid) {
            achievement.isValid = options.isValid.bind(this);
        }

        if (options.isRelevant) {
            achievement.isRelevant = options.isRelevant.bind(this);
        }

        if (options.signal) {
            achievement.signal = options.signal;
        }

        this.map.set(key, achievement);
    }

    bulkUnlock() {
        for (let i = 0; i < arguments.length; i += 2) {
            this.unlock(arguments[i], arguments[i + 1]);
        }
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @param {?*} data - Data received from signal dispatches for validation
     */
    unlock(key, data) {
        if (!this.map.has(key)) {
            return;
        }

        const achievement = this.map.get(key);

        if (!achievement.isValid(data, achievement.state)) {
            return;
        }

        achievement.unlock()
            .then(() => {
                this.onActivate(null, key);
            })
            .catch(err => {
                this.onActivate(err, key);
            });
    }

    /**
     * Cleans up after achievement activation attempt with the provider. Could
     * utilize err to retry some number of times if needed.
     * @param {?Error} err - Error is null if activation was successful
     * @param {string} key - Maps to an Achievement
     */
    onActivate(err, key) {
        this.remove(key);

        if (!this.hasDefaultReceivers()) {
            this.root.signals.achievementCheck.remove(this.unlock);
        }
    }

    /** @param {string} key - Maps to an Achievement */
    remove(key) {
        const achievement = this.map.get(key);

        if (achievement.receiver) {
            this.root.signals[achievement.signal].remove(achievement.receiver);
        }

        this.map.delete(key);
    }

    hasDefaultReceivers() {
        if (!this.map.size) {
            return false;
        }

        for (let achievement of this.map.values()) {
            if (!achievement.signal) {
                return true;
            }
        }

        return false;
    }

    hasAllUpgradesAtTier(tier) {
        const upgrades = this.root.gameMode.getUpgrades();

        for (let upgradeId in upgrades) {
            if (this.root.hubGoals.getUpgradeLevel(upgradeId) < tier - 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param {BaseItem} item
     * @param {string} shape
     * @returns {boolean}
     */
    isShape(item, shape) {
        return item.getItemType() === ITEM_SHAPE && item.definition.getHash() === shape;
    }

    createLevelOptions(level) {
        return {
            isRelevant: () => this.root.hubGoals.level < level,
            isValid: (currentLevel) => currentLevel === level,
            signal: "storyGoalCompleted",
        };
    }

    createRateOptions(shape, rate) {
        return {
            isValid: () => {
                return this.root.productionAnalytics.getCurrentShapeRate(
                    enumAnalyticsDataSource.produced,
                    this.root.shapeDefinitionMgr.getShapeFromShortKey(shape)
                ) >= rate;
            }
        };
    }

    createShapeOptions(shape) {
        return {
            isValid: (item) => this.isShape(item, shape),
            signal: "itemProduced",
        };
    }

    createSpeedOptions(level, time) {
        return {
            isRelevant: () => this.root.hubGoals.level <= level && this.root.time.now() < time,
            isValid: (currentLevel) => currentLevel === level && this.root.time.now() < time,
            signal: "storyGoalCompleted",
        };
    }

    createTimeOptions(duration) {
        return {
            isRelevant: () => this.root.time.now() < duration,
            isValid: () => this.root.time.now() >= duration,
        };
    }

    createUpgradeOptions(tier) {
        return {
            isRelevant: () => !this.hasAllUpgradesAtTier(tier),
            isValid: () => this.hasAllUpgradesAtTier(tier),
            signal: "upgradePurchased",
        };
    }

    /** @param {Entity} entity @returns {boolean} */
    isBelt500TilesValid(entity) {
        return entity.components.Belt && entity.components.Belt.assignedPath.totalLength >= 500;
    }

    /** @param {ShapeDefinition} definition @returns {boolean} */
    isBlueprint100kValid(definition) {
        return (
            definition.cachedHash === SHAPE_BP &&
            this.root.hubGoals.storedShapes[SHAPE_BP] >= 100000
        );
    }

    /** @param {ShapeDefinition} definition @returns {boolean} */
    isBlueprint1mValid(definition) {
        return (
            definition.cachedHash === SHAPE_BP &&
            this.root.hubGoals.storedShapes[SHAPE_BP] >= 1000000
        );
    }

    /** @returns {boolean} */
    isDarkModeValid() {
        return this.root.app.settings.currentData.settings.theme === DARK_MODE;
    }

    /** @param {number} count @returns {boolean} */
    isDestroy1000Valid(count) {
        return count >= 1000;
    }

    /** @param {ShapeDefinition} definition @returns {boolean} */
    isIrrelevantShapeValid(definition) {
        if (definition.cachedHash === this.root.hubGoals.currentGoal.definition.cachedHash) {
            return false;
        }

        const upgrades = this.root.gameMode.getUpgrades();
        for (let upgradeId in upgrades) {
            const currentTier = this.root.hubGoals.getUpgradeLevel(upgradeId);
            const requiredShapes = upgrades[upgradeId][currentTier].required;

            for (let i = 0; i < requiredShapes.length; i++) {
                if (definition.cachedHash === requiredShapes[i].shape) {
                    return false;
                }
            }
        }

        return true;
    }

    /** @returns {boolean} */
    isLogoBefore18Relevant() {
        return this.root.hubGoals.level < 18;
    }

    /** @param {BaseItem} item @returns {boolean} */
    isLogoBefore18Valid(item) {
        return this.root.hubGoals.level < 18 && this.isShape(item, SHAPE_LOGO);
    }

    /** @returns {boolean} */
    isMapMarkers15Relevant() {
        return this.root.hud.parts.waypoints.waypoints.length < 16; // 16 - HUB
    }

    /** @param {number} count @returns {boolean} */
    isMapMarkers15Valid(count) {
        return count === 15;
    }

    /** @param {string} currentLayer @returns {boolean} */
    isOpenWiresValid(currentLayer) {
        return currentLayer === WIRE_LAYER;
    }

    /** @param {Entity} entity @returns {boolean} */
    isPlace5000WiresValid(entity) {
        return (
            entity.components.Wire &&
            entity.registered &&
            entity.root.entityMgr.componentToEntity.Wire.length === 5000
        );
    }

    /** @param {number} count @returns {boolean} */
    isPlaceBlueprintValid(count) {
        return count != 0;
    }

    /** @param {number} count @returns {boolean} */
    isPlaceBp1000Valid(count) {
        return count >= 1000;
    }

    /** @param {string} key @param {BaseItem} item @returns {boolean} */
    isStack4LayersValid(item) {
        return item.getItemType() === ITEM_SHAPE && item.definition.layers.length === 4;
    }

    /** @returns {boolean} */
    isStore100UniqueRelevant() {
        return Object.keys(this.root.hubGoals.storedShapes).length < 100;
    }

    /** @returns {boolean} */
    isStore100UniqueValid() {
        return Object.keys(this.root.hubGoals.storedShapes).length === 100;
    }

    /** @param {StorageComponent} storage @returns {boolean} */
    isStoreShapeValid() {
        const entities = this.root.systemMgr.systems.storage.allEntities;

        if (entities.length === 0) {
            return false;
        }

        for (var i = 0; i < entities.length; i++) {
            if (entities[i].components.Storage.storedCount > 0) {
                return true;
            }
        }

        return false;
    }

    initTrash1000(achievement) {
        // get state from root
        console.log(this.root.savegame.currentData.dump);

        achievement.state = achievement.state || {
            count: 0
        };
    }
    /**
     * @params {number} count
     * @params {object} state - The achievement's current state
     * @returns {boolean} */
    isTrash1000Valid(count, state) {
        state.count += count;

        return state.count >= 1000;
    }
}
