/* typehints:start */
import { enumHubGoalRewards } from "./tutorial_goals";
import { GameRoot } from "./root";
/* typehints:end */

import { gGameModeRegistry } from "../core/global_registries";
import { types, BasicSerializableObject } from "../savegame/serialization";

/** @typedef {{
 *   shape: string,
 *   amount: number
 * }} UpgradeRequirement */

/** @typedef {{
 *   required: Array<UpgradeRequirement>
 *   improvement?: number,
 *   excludePrevious?: boolean
 * }} TierRequirement */

/** @typedef {Array<TierRequirement>} UpgradeTiers */

/** @typedef {{
 *   shape: string,
 *   required: number,
 *   reward: enumHubGoalRewards,
 *   throughputOnly?: boolean
 * }} LevelDefinition */

export class GameMode extends BasicSerializableObject {
    /** @returns {string} */
    static getId() {
        abstract;
        return "unknown-mode";
    }

    static getSchema() {
        return {
            id: types.string
        }
    }

    static create (root) {
        let id;

        if (!root.savegame.gameMode || !root.savegame.gameMode.id) {
            id = "Regular";
        } else {
            id = root.savegame.gameMode.id
        }

        const Mode = gGameModeRegistry.findById(id);

        return new Mode(root);
    }

    /** @param {GameRoot} root */
    constructor(root) {
        super();
        this.root = root;
        this.id = this.getId();
    }

    getId() {
        // @ts-ignore
        return this.constructor.getId();
    }

    /**
     * Should return all available upgrades
     * @returns {Object<string, UpgradeTiers>}
     */
    getUpgrades() {
        abstract;
        return null;
    }

    /**
     * Returns the blueprint shape key
     * @returns {string}
     */
    getBlueprintShapeKey() {
        abstract;
        return null;
    }

    /**
     * Returns the goals for all levels including their reward
     * @returns {Array<LevelDefinition>}
     */
    getLevelDefinitions() {
        abstract;
        return null;
    }

    /**
     * Should return whether free play is available or if the game stops
     * after the predefined levels
     * @returns {boolean}
     */
    getIsFreeplayAvailable() {
        return true;
    }
}
