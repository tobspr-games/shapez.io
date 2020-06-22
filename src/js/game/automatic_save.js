import { GameRoot } from "./root";
import { globalConfig, IS_DEBUG } from "../core/config";
import { Math_max } from "../core/builtins";
import { createLogger } from "../core/logging";

// How important it is that a savegame is created
/**
 * @enum {number}
 */
export const enumSavePriority = {
    regular: 2,
    asap: 100,
};

const logger = createLogger("autosave");

// Internals
let MIN_INTERVAL_SECS = 600;

export class AutomaticSave {
    constructor(root) {
        /** @type {GameRoot} */
        this.root = root;

        // Store the current maximum save importance
        this.saveImportance = enumSavePriority.regular;

        this.lastSaveAttempt = -1000;
    }

    setSaveImportance(importance) {
        this.saveImportance = Math_max(this.saveImportance, importance);
    }

    doSave() {
        if (G_IS_DEV && globalConfig.debug.disableSavegameWrite) {
            return;
        }

        this.root.gameState.doSave();
        this.saveImportance = enumSavePriority.regular;
    }

    update() {
        if (!this.root.gameInitialized) {
            // Bad idea
            return;
        }

        // Check when the last save was, but make sure that if it fails, we don't spam
        const lastSaveTime = Math_max(this.lastSaveAttempt, this.root.savegame.getRealLastUpdate());

        let secondsSinceLastSave = (Date.now() - lastSaveTime) / 1000.0;
        let shouldSave = false;

        switch (this.saveImportance) {
            case enumSavePriority.asap:
                // High always should save
                shouldSave = true;
                break;

            case enumSavePriority.regular:
                // Could determine if there is a good / bad point here
                shouldSave = secondsSinceLastSave > MIN_INTERVAL_SECS;
                break;

            default:
                assert(false, "Unknown save prio: " + this.saveImportance);
                break;
        }
        if (shouldSave) {
            logger.log("Saving automatically");
            this.lastSaveAttempt = Date.now();
            this.doSave();
        }
    }
}
