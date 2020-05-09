/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { BasicSerializableObject } from "../../savegame/serialization";

export class BaseGameSpeed extends BasicSerializableObject {
    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        super();
        this.root = root;
        this.initializeAfterDeserialize(root);
    }

    /** @returns {string} */
    static getId() {
        abstract;
        return "unknown-speed";
    }

    getId() {
        // @ts-ignore
        return this.constructor.getId();
    }

    static getSchema() {
        return {};
    }

    initializeAfterDeserialize(root) {
        this.root = root;
    }

    /**
     * Returns the time multiplier
     */
    getTimeMultiplier() {
        return 1;
    }

    /**
     * Returns how many logic steps there may be queued
     */
    getMaxLogicStepsInQueue() {
        return 3;
    }

    // Internals
    /** @returns {BaseGameSpeed} */
    newSpeed(instance) {
        return new instance(this.root);
    }
}
