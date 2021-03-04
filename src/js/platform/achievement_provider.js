/* typehints:start */
import { Application } from "../application";
import { StorageComponent } from "../game/components/storage";
import { Entity } from "../game/entity";
import { GameRoot } from "../game/root";
import { ShapeDefinition } from "../game/shape_definition";
/* typehints:end */

export const ACHIEVEMENTS = {
    belt500Tiles: "belt500Tiles",
    blueprint100k: "blueprint100k",
    blueprint1m: "blueprint1m",
    completeLvl26: "completeLvl26",
    cutShape: "cutShape",
    darkMode: "darkMode",
    level100: "level100",
    level50: "level50",
    paintShape: "paintShape",
    place5000Wires: "place5000Wires",
    placeBlueprint: "placeBlueprint",
    produceLogo: "produceLogo",
    produceMsLogo: "produceMsLogo",
    produceRocket: "produceRocket",
    rotateShape: "rotateShape",
    stack4Layers: "stack4Layers",
    stackShape: "stackShape",
    store100Unique: "store100Unique",
    storeShape: "storeShape",
    unlockWires: "unlockWires",
};

const DARK_MODE = "dark";
const SHAPE_BLUEPRINT = "CbCbCbRb:CwCwCwCw";
const SHAPE_LOGO = "RuCw--Cw:----Ru--";
const SHAPE_MS_LOGO = "RgRyRbRr";
const SHAPE_ROCKET = "CbCuCbCu:Sr------:--CrSrCr:CwCwCwCw";

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
        this.initialized = false;

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
        this.createAndSet(ACHIEVEMENTS.level100, this.createLevelOptions(100));
        this.createAndSet(ACHIEVEMENTS.level50, this.createLevelOptions(50));
        this.createAndSet(ACHIEVEMENTS.paintShape);
        this.createAndSet(ACHIEVEMENTS.place5000Wires, {
            isValid: this.isPlace5000WiresValid,
        });
        this.createAndSet(ACHIEVEMENTS.placeBlueprint, {
            isValid: this.isPlaceBlueprintValid,
        });
        this.createAndSet(ACHIEVEMENTS.produceLogo, this.createShapeOptions(SHAPE_LOGO));
        this.createAndSet(ACHIEVEMENTS.produceRocket, this.createShapeOptions(SHAPE_ROCKET));
        this.createAndSet(ACHIEVEMENTS.produceMsLogo, this.createShapeOptions(SHAPE_MS_LOGO));
        this.createAndSet(ACHIEVEMENTS.rotateShape);
        this.createAndSet(ACHIEVEMENTS.stack4Layers, {
            isValid: this.isStack4LayersValid,
        });
        this.createAndSet(ACHIEVEMENTS.stackShape);
        this.createAndSet(ACHIEVEMENTS.store100Unique, {
            isRelevant: this.isStore100UniqueRelevant,
            isValid: this.isStore100UniqueValid,
            signal: "shapeDelivered",
        });
        this.createAndSet(ACHIEVEMENTS.storeShape, {
            isValid: this.isStoreShapeValid,
            signal: "entityGotNewComponent",
        });
        this.createAndSet(ACHIEVEMENTS.unlockWires, this.createLevelOptions(20));
    }

    /** @param {GameRoot} root */
    initialize(root) {
        this.root = root;
        this.root.signals.achievementUnlocked.add(this.unlock, this);

        for (let [key, achievement] of this.map.entries()) {
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
            this.root.signals.achievementUnlocked.remove(this.unlock);
        }

        this.initialized = true;
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @param {object} [options]
     * @param {function} [options.isValid]
     * @param {function} [options.isRelevant]
     * @param {string} [options.signal]
     */
    createAndSet(key, options = {}) {
        const achievement = new Achievement(key);

        achievement.activate = this.activate;

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

    /**
     * @param {string} key - Maps to an Achievement
     * @param {*[]} [arguments] - Additional arguments received from signal dispatches
     */
    unlock(key) {
        if (!this.map.has(key)) {
            return;
        }

        const achievement = this.map.get(key);

        if (!achievement.isValid(...arguments)) {
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
    onActivate (err, key) {
        this.remove(key);

        if (!this.hasDefaultReceivers()) {
            this.root.signals.achievementUnlocked.remove(this.unlock);
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

    createLevelOptions (level) {
        return {
            isRelevant: () => this.root.hubGoals.level < level,
            isValid: (key, currentLevel) => currentLevel === level,
            signal: "storyGoalCompleted"
        }
    }

    createShapeOptions (shape) {
        return {
            isValid: (key, definition) => definition.cachedHash === shape
        }
    }

    /**
     * @param {string} key
     * @param {Entity} entity
     * @returns {boolean}
     */
    isBelt500TilesValid(key, entity) {
        return entity.components.Belt && entity.components.Belt.assignedPath.totalLength >= 500;
    }

    /**
     * @param {string} key
     * @param {ShapeDefinition} definition
     * @returns {boolean}
     */
    isBlueprint100kValid(key, definition) {
        return definition.cachedHash === SHAPE_BLUEPRINT &&
            this.root.hubGoals.storedShapes[SHAPE_BLUEPRINT] >= 100000;
    }

    /**
     * @param {string} key
     * @param {ShapeDefinition} definition
     * @returns {boolean}
     */
    isBlueprint1mValid(key, definition) {
        return definition.cachedHash === SHAPE_BLUEPRINT &&
            this.root.hubGoals.storedShapes[SHAPE_BLUEPRINT] >= 1000000;
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    isDarkModeValid(key) {
        return this.root.app.settings.currentData.settings.theme === DARK_MODE;
    }

    /**
     * @param {string} key
     * @param {Entity} entity
     * @returns {boolean}
     */
    isPlace5000WiresValid(key, entity) {
        return entity.components.Wire &&
            entity.registered &&
            entity.root.entityMgr.componentToEntity.Wire.length === 5000;
    }

    /**
     * @param {string} key
     * @param {boolean} anyPlaced
     * @returns {boolean}
     */
    isPlaceBlueprintValid(key, anyPlaced) {
        return anyPlaced;
    }

    /**
     * @param {string} key
     * @param {ShapeDefinition} definition
     * @returns {boolean}
     */
    isStack4LayersValid(key, definition) {
        return definition.layers.length === 4;
    }

    /** @returns {boolean} */
    isStore100UniqueRelevant() {
        return Object.keys(this.root.hubGoals.storedShapes).length < 100;
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    isStore100UniqueValid(key) {
        return Object.keys(this.root.hubGoals.storedShapes).length === 100;
    }

    /**
     * @param {string} key
     * @param {StorageComponent} storage
     * @returns {boolean}
     */
    isStoreShapeValid(key, storage) {
        return storage.storedCount >= 1;
    }
}
