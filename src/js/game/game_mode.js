/* typehints:start */
import { GameRoot } from "./root";
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

    /**
     * @param {string} name - Class name of HUD Part
     * @returns {boolean}
     */
    isHudPartHidden(name) {
        return false;
    }

    /**
     * @param {string} name - Class name of HUD Part
     * @returns {boolean}
     */
    isHudPartExcluded(name) {
        return false;
    }

    /** @returns {boolean} */
    hasZone() {
        return false;
    }

    /** @returns {boolean} */
    hasHints() {
        return true;
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
    hasBoundaries() {
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

    /** @returns {object} */
    getUpgrades() {
        return {};
    }

    /** @returns {number} */
    getZoneWidth() {
        return 0;
    }

    /** @returns {number} */
    getZoneHeight() {
        return 0;
    }

    /** @returns {number} */
    getBoundaryWidth() {
        return Infinity;
    }

    /** @returns {number} */
    getBoundaryHeight() {
        return Infinity;
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
