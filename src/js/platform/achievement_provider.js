/* typehints:start */
import { Application } from "../application";
import { StorageComponent } from "../game/components/storage";
import { Entity } from "../game/entity";
import { GameRoot } from "../game/root";
import { ShapeDefinition } from "../game/shape_definition";
/* typehints:end */

export const ACHIEVEMENTS = {
    blueprints: "blueprints",
    cutting: "cutting",
    darkMode: "darkMode",
    fourLayers: "fourLayers",
    freedom: "freedom",
    hundredShapes: "hundredShapes",
    longBelt: "longBelt",
    millionBlueprintShapes: "millionBlueprintShapes",
    networked: "networked",
    painting: "painting",
    rotating: "rotating",
    stacking: "stacking",
    storage: "storage",
    theLogo: "theLogo",
    toTheMoon: "toTheMoon",
    wires: "wires",
};

const BLUEPRINT_SHAPE = "CbCbCbRb:CwCwCwCw";
const DARK_MODE = "dark";
const FREEDOM_LEVEL = 26;
const LOGO_SHAPE = "RuCw--Cw:----Ru--";
const LONG_BELT_COUNT = 200;
const NETWORKED_WIRE_COUNT = 100;
const ONE_HUNDRED = 100;
const ONE_MILLION = 1000000;
const ROCKET_SHAPE = "CbCuCbCu:Sr------:--CrSrCr:CwCwCwCw";
const WIRES_LEVEL = 20;

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

        this.createAndSet(ACHIEVEMENTS.blueprints, {
            isValid: this.isBlueprintsValid
        });
        this.createAndSet(ACHIEVEMENTS.cutting);
        this.createAndSet(ACHIEVEMENTS.darkMode, {
            isValid: this.isDarkModeValid
        });
        this.createAndSet(ACHIEVEMENTS.fourLayers, {
            isValid: this.isFourLayersValid
        });
        this.createAndSet(ACHIEVEMENTS.freedom, {
            isRelevant: this.isFreedomRelevant,
            isValid: this.isFreedomValid,
            signal: "storyGoalCompleted"
        });
        this.createAndSet(ACHIEVEMENTS.hundredShapes, {
            isRelevant: this.isHundredShapesRelevant,
            isValid: this.isHundredShapesValid,
            signal: "shapeDelivered"
        });
        this.createAndSet(ACHIEVEMENTS.longBelt, {
            isValid: this.isLongBeltValid,
            signal: "entityAdded"
        });
        this.createAndSet(ACHIEVEMENTS.millionBlueprintShapes, {
            isValid: this.isMillionBlueprintShapesValid,
            signal: "shapeDelivered"
        });
        this.createAndSet(ACHIEVEMENTS.networked, {
            isValid: this.isNetworkedValid,
        });
        this.createAndSet(ACHIEVEMENTS.painting);
        this.createAndSet(ACHIEVEMENTS.rotating);
        this.createAndSet(ACHIEVEMENTS.stacking);
        this.createAndSet(ACHIEVEMENTS.storage, {
            isValid: this.isStorageValid,
            signal: "entityGotNewComponent"
        });
        this.createAndSet(ACHIEVEMENTS.theLogo, {
            isValid: this.isTheLogoValid
        });
        this.createAndSet(ACHIEVEMENTS.toTheMoon, {
            isValid: this.isToTheMoonValid
        });
        this.createAndSet(ACHIEVEMENTS.wires, {
            isRelevant: this.isWiresRelevant,
            isValid: this.isWiresValid,
            signal: "storyGoalCompleted"
        });
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
    createAndSet(key, options) {
        const achievement = new Achievement(key);

        achievement.activate = this.activate;

        if (options) {
            if (options.isValid) {
                achievement.isValid = options.isValid.bind(this);
            }

            if (options.isRelevant) {
                achievement.isRelevant = options.isRelevant.bind(this);
            }

            if (options.signal) {
                achievement.signal = options.signal;
            }
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

        return achievement.unlock()
            .finally(() => {
                this.remove(key);

                if (!this.hasDefaultReceivers()) {
                    this.root.signals.achievementUnlocked.remove(this.unlock);
                }
            });
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

    /**
     * @param {string} key
     * @param {boolean} anyPlaced
     * @returns {boolean}
     */
    isBlueprintsValid(key, anyPlaced) {
        return anyPlaced;
    }

    /** @returns {boolean} */
    isWiresRelevant() {
        return this.root.hubGoals.level < WIRES_LEVEL;
    }

    /**
     * @param {string} key
     * @param {number} level
     * @returns {boolean}
     */
    isWiresValid(key, level) {
        return level === WIRES_LEVEL;
    }

    /**
     * @param {string} key
     * @param {StorageComponent} storage
     * @returns {boolean}
     */
    isStorageValid(key, storage) {
        return storage.storedCount >= 1;
    }

    /** @returns {boolean} */
    isFreedomRelevant() {
        return this.root.hubGoals.level < FREEDOM_LEVEL;
    }

    /**
     * @param {string} key
     * @param {number} level
     * @returns {boolean}
     */
    isFreedomValid(key, level) {
        return level === FREEDOM_LEVEL;
    }

    /**
     * @param {string} key
     * @param {Entity} entity
     * @returns {boolean}
     */
    isNetworkedValid(key, entity) {
        return entity.components.Wire &&
            entity.registered &&
            entity.root.entityMgr.componentToEntity.Wire.length === NETWORKED_WIRE_COUNT;
    }

    /**
     * @param {string} key
     * @param {ShapeDefinition} definition
     * @returns {boolean}
     */
    isTheLogoValid(key, definition) {
        return definition.layers.length === 2 && definition.cachedHash === LOGO_SHAPE;
    }

    /**
     * @param {string} key
     * @param {ShapeDefinition} definition
     * @returns {boolean}
     */
    isToTheMoonValid(key, definition) {
        return definition.layers.length === 4 && definition.cachedHash === ROCKET_SHAPE;
    }

    /**
     * @param {string} key
     * @param {ShapeDefinition} definition
     * @returns {boolean}
     */
    isMillionBlueprintShapesValid(key, definition) {
        return definition.cachedHash === BLUEPRINT_SHAPE &&
            this.root.hubGoals.storedShapes[BLUEPRINT_SHAPE] >= ONE_MILLION;
    }

    /** @returns {boolean} */
    isHundredShapesRelevant() {
        return Object.keys(this.root.hubGoals.storedShapes).length < ONE_HUNDRED;
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    isHundredShapesValid(key) {
        return Object.keys(this.root.hubGoals.storedShapes).length === ONE_HUNDRED;
    }

    /**
     * @param {string} key
     * @param {ShapeDefinition} definition
     * @returns {boolean}
     */
    isFourLayersValid(key, definition) {
        return definition.layers.length === 4;
    }

    /**
     * @param {string} key
     * @param {Entity} entity
     * @returns {boolean}
     */
    isLongBeltValid(key, entity) {
        return entity.components.Belt &&
            entity.components.Belt.assignedPath.totalLength >= LONG_BELT_COUNT;
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    isDarkModeValid(key) {
        return this.root.app.settings.currentData.settings.theme === DARK_MODE;
    }

}
