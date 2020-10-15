import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { GameRoot } from "./root";

// How important it is that a savegame is created
/**
 * @enum {number}
 */
export const enumSavePriority = {
    regular: 2,
    asap: 100,
};

const logger = createLogger("autosave");

export class AutomaticSave {
    constructor(root) {
        /** @type {GameRoot} */
        this.root = root;

        // Store the current maximum save importance
        this.saveImportance = enumSavePriority.regular;

        this.lastSaveAttempt = -1000;
    }

    setSaveImportance(importance) {
        this.saveImportance = Math.max(this.saveImportance, importance);
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

        const saveInterval = this.root.app.settings.getAutosaveIntervalSeconds();
        if (!saveInterval) {
            // Disabled
            return;
        }

        // Check when the last save was, but make sure that if it fails, we don't spam
        const lastSaveTime = Math.max(this.lastSaveAttempt, this.root.savegame.getRealLastUpdate());

        const secondsSinceLastSave = (Date.now() - lastSaveTime) / 1000.0;
        let shouldSave = false;

        switch (this.saveImportance) {
            case enumSavePriority.asap:
                // High always should save
                shouldSave = true;
                break;

            case enumSavePriority.regular:
                // Could determine if there is a good / bad point here
                shouldSave = secondsSinceLastSave > saveInterval;
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
