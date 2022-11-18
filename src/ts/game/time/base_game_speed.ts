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
    getId(): any {
        // @ts-ignore

        return this.constructor.getId();
    }
    static getSchema(): any {
        return {};
    }
    initializeAfterDeserialize(root: any): any {
        this.root = root;
    }
    /**
     * Returns the time multiplier
     */
    getTimeMultiplier(): any {
        return 1;
    }
    /**
     * Returns how many logic steps there may be queued
     */
    getMaxLogicStepsInQueue(): any {
        return 3;
    }
    // Internals
    /** {} */
    newSpeed(instance: any): BaseGameSpeed {
        return new instance(this.root);
    }
}
