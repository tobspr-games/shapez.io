/* typehints:start */
import { GameRoot } from "./root";
import { Rectangle } from "../core/rectangle";
/* typehints:end */

import { gGameModeRegistry } from "../core/global_registries";
import { types, BasicSerializableObject } from "../savegame/serialization";
import { MetaBuilding } from "./meta_building";
import { MetaItemProducerBuilding } from "./buildings/item_producer";

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
        this.hiddenHudParts = {};

        /** @type {typeof MetaBuilding[]} */
        this.hiddenBuildings = [MetaItemProducerBuilding];
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
    isHudPartExcluded(name) {
        return this.hiddenHudParts[name] === false;
    }

    /**
     * @param {typeof MetaBuilding} building - Class name of building
     * @returns {boolean}
     */
    isBuildingExcluded(building) {
        return this.hiddenBuildings.indexOf(building) >= 0;
    }

    /** @returns {undefined|Rectangle[]} */
    getBuildableZones() {
        return;
    }

    /** @returns {Rectangle|undefined} */
    getCameraBounds() {
        return;
    }

    /** @returns {boolean} */
    hasHub() {
        return true;
    }

    /** @returns {boolean} */
    hasResources() {
        return true;
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

    throughputDoesNotMatter() {
        return false;
    }

    /**
     * @param {number} w
     * @param {number} h
     */
    expandZone(w = 0, h = 0) {
        abstract;
        return;
    }

    /** @returns {array} */
    getLevelDefinitions() {
        return [];
    }

    /** @returns {boolean} */
    getIsFreeplayAvailable() {
        return false;
    }

    /** @returns {boolean} */
    getIsSaveable() {
        return true;
    }

    /** @returns {boolean} */
    getSupportsCopyPaste() {
        return true;
    }

    /** @returns {boolean} */
    getSupportsWires() {
        return true;
    }

    /** @returns {boolean} */
    getIsDeterministic() {
        return false;
    }

    /** @returns {boolean} */
    getIsEditor() {
        return false;
    }

    /** @returns {number | undefined} */
    getFixedTickrate() {
        return;
    }

    /** @returns {string} */
    getBlueprintShapeKey() {
        return "CbCbCbRb:CwCwCwCw";
    }
}
