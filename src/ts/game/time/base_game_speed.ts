/* typehints:start */
import type { GameRoot } from "../root";
/* typehints:end */
import { BasicSerializableObject } from "../../savegame/serialization";
export class BaseGameSpeed extends BasicSerializableObject {
    public root = root;

        constructor(root) {
        super();
        this.initializeAfterDeserialize(root);
    }
    /** {} */
    static getId(): string {
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
    /** {} */
    newSpeed(instance): BaseGameSpeed {
        return new instance(this.root);
    }
}
