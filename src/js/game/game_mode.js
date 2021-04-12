/* typehints:start */
import { GameRoot } from "./root";
import { Rectangle } from "../core/rectangle";
/* typehints:end */

import { gGameModeRegistry } from "../core/global_registries";
import { types, BasicSerializableObject } from "../savegame/serialization";

/** @enum {string} */
export const enumGameModeIds = {
    puzzleEdit: "puzzleEditMode",
    puzzlePlay: "puzzlePlayMode",
    regular: "regularMode",
};

/** @enum {string} */
export const enumGameModeTypes = {
    default: "defaultModeType",
    puzzle: "puzzleModeType",
};

export class GameMode extends BasicSerializableObject {
    /** @returns {string} */
    static getId() {
        abstract;
        return "unknownMode";
    }

    /** @returns {string} */
    static getType() {
        abstract;
        return "unknownType";
    }
    /**
     * @param {GameRoot} root
     * @param {string} [id=Regular]
     */
    static create(root, id = enumGameModeIds.regular) {
        return new (gGameModeRegistry.findById(id))(root);
    }

    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        super();
        this.root = root;
        this.hudParts = {};
        this.buildings = {};
    }

    /** @returns {object} */
    serialize() {
        return {
            $: this.getId(),
            data: super.serialize(),
        };
    }

    /** @param {object} savedata */
    deserialize({ data }) {
        super.deserialize(data, this.root);
    }

    /** @returns {string} */
    getId() {
        // @ts-ignore
        return this.constructor.getId();
    }

    /** @returns {string} */
    getType() {
        // @ts-ignore
        return this.constructor.getType();
    }

    setBuildings(buildings) {
        Object.assign(this.buildings, buildings);
    }

    setHudParts(parts) {
        Object.assign(this.hudParts, parts);
    }

    /**
     * @param {string} name - Class name of HUD Part
     * @returns {boolean}
     */
    isHudPartExcluded(name) {
        return this.hudParts[name] === false;
    }

    /**
     * @param {string} name - Class name of building
     * @returns {boolean}
     */
    isBuildingExcluded(name) {
        return this.buildings[name] === false;
    }

    /** @returns {boolean} */
    hasZone() {
        return false;
    }

    /** @returns {boolean} */
    hasHub() {
        return true;
    }

    /** @returns {boolean} */
    hasResources() {
        return true;
    }

    /** @returns {boolean} */
    hasBounds() {
        return false;
    }

    /** @returns {boolean} */
    isZoneRestricted() {
        return false;
    }

    /** @returns {boolean} */
    isBoundaryRestricted() {
        return false;
    }

    /** @returns {number} */
    getMinimumZoom() {
        return 0.1;
    }

    /** @returns {number} */
    getMaximumZoom() {
        return 3.5;
    }

    /** @returns {Object<string, Array>} */
    getUpgrades() {
        return {
            belt: [],
            miner: [],
            processors: [],
            painting: [],
        };
    }

    /** @returns {?Rectangle} */
    getZone() {
        return null;
    }

    /**
     * @param {number} w
     * @param {number} h
     */
    expandZone(w = 0, h = 0) {
        abstract;
        return;
    }

    /** @returns {?Rectangle} */
    getBounds() {
        return null;
    }

    /** @returns {array} */
    getLevelDefinitions() {
        return [];
    }

    /** @returns {boolean} */
    getIsFreeplayAvailable() {
        return false;
    }

    /** @returns {string} */
    getBlueprintShapeKey() {
        return "CbCbCbRb:CwCwCwCw";
    }
}
