/* typehints:start */
import { Application } from "../application";
import { StorageComponent } from "../game/components/storage";
import { Entity } from "../game/entity";
import { GameRoot } from "../game/root";
import { ShapeDefinition } from "../game/shape_definition";
/* typehints:end */

export const ACHIEVEMENTS = {
    painting: "painting",
    cutting: "cutting",
    rotating: "rotating",
    stacking: "stacking",
    blueprints: "blueprints",
    wires: "wires",
    storage: "storage",
    freedom: "freedom",
    networked: "networked",
    theLogo: "theLogo",
    toTheMoon: "toTheMoon",
    millionBlueprintShapes: "millionBlueprintShapes",

    hundredShapes: "hundredShapes",
};

const ONE_HUNDRED = 100;
const ONE_MILLION = 1000000;
const BLUEPRINT_SHAPE = "CbCbCbRb:CwCwCwCw";
const LOGO_SHAPE = "RuCw--Cw:----Ru--";
const ROCKET_SHAPE = "CbCuCbCu:Sr------:--CrSrCr:CwCwCwCw";
const FREEDOM_LEVEL = 26;
const WIRES_LEVEL = 20;
const NETWORKED_WIRE_COUNT = 100;

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
        this.unlocked = false;
        this.signal = null;
        this.receiver = null;
        this.activate = null;
        this.activatePromise = null;
    }

    isValid () {
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
     * @param {string[]} keys - An array of ACHIEVEMENTS keys
     * @param {function} [activate] - Resolves when provider activation is complete
     */
    constructor(keys, activate) {
        this.map = new Map();
        this.activate = activate;

        assert(Object.keys(ACHIEVEMENTS).length === keys.length, "Mismatched achievements");

        for (var i = 0; i < keys.length; i++) {
            assert(ACHIEVEMENTS[keys[i]], "Achievement does not exist: " + keys[i]);
        }
    }

    /** @param {GameRoot} root */
    initialize(root) {
        this.root = root;
        this.root.signals.achievementUnlocked.add(this.unlock, this);

        this.createAndSet(ACHIEVEMENTS.painting)
        this.createAndSet(ACHIEVEMENTS.cutting)
        this.createAndSet(ACHIEVEMENTS.rotating)
        this.createAndSet(ACHIEVEMENTS.stacking)
        this.createAndSet(ACHIEVEMENTS.blueprints, this.isBlueprintsValid);

        if (this.isWiresRelevant()) {
            this.createAndSet(ACHIEVEMENTS.wires, this.isWiresValid, "storyGoalCompleted");
        }

        this.createAndSet(ACHIEVEMENTS.storage, this.isStorageValid, "entityGotNewComponent");

        if (this.isFreedomRelevant()) { // ...is it?
            this.createAndSet(ACHIEVEMENTS.freedom, this.isFreedomValid, "storyGoalCompleted");
        }

        this.createAndSet(ACHIEVEMENTS.networked, this.isNetworkedValid);
        this.createAndSet(ACHIEVEMENTS.theLogo, this.isTheLogoValid);
        this.createAndSet(ACHIEVEMENTS.toTheMoon, this.isToTheMoonValid);
        this.createAndSet(
            ACHIEVEMENTS.millionBlueprintShapes,
            this.isMillionBlueprintShapesValid,
            "shapeDelivered"
        );

        if (this.isHundredShapesRelevant()) {
            this.createAndSet(
                ACHIEVEMENTS.hundredShapes,
                this.isHundredShapesValid,
                "shapeDelivered"
            );
        }
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @param {function} [isValid] - Validates achievement when a signal message is received
     * @param {string} [signal] - Signal name to listen to for unlock attempts
     */
    createAndSet(key, isValid, signal) {
        const achievement = new Achievement(key);

        achievement.activate = this.activate;

        if (isValid) {
            achievement.isValid = isValid.bind(this);
        }

        if (signal) {
            achievement.signal = signal;
            achievement.receiver = this.unlock.bind(this, key);
            this.root.signals[achievement.signal].add(achievement.receiver);
        }

        this.map.set(key, achievement);
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @param {*[]} [arguments] - Additional arguments received from signal dispatches
     */
    unlock(key) {
        if (!this.map.has(key)) {
            console.log("Achievement unlocked or irrelevant:", key);
            return;
        }

        const achievement = this.map.get(key);

        if (!achievement.isValid(...arguments)) {
            console.log("Achievement is invalid:", key);
            return;
        }

        return achievement.unlock()
            .finally(() => {
                if (achievement.receiver) {
                    this.root.signals[achievement.signal].remove(achievement.receiver);
                    console.log("Achievement receiver removed:", key);
                }

                this.map.delete(key);

                if (!this.hasDefaultReceivers()) {
                    this.root.signals.achievementUnlocked.remove(this.unlock);
                    console.log("removed achievementUnlocked receiver");
                }
            });
    }

    hasDefaultReceivers() {
        if (!this.map.size) {
            return false;
        }

        for(let achievement of this.map.values()) {
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
}
