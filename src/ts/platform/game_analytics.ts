
export type Application = import("../application").Application;
export class GameAnalyticsInterface {
    public app: Application = app;

    constructor(app) {
    }
    /**
     * Initializes the analytics
     * {}
     * @abstract
     */
    initialize(): Promise<void> {
        abstract;
        return Promise.reject();
    }
    /**
     * Handles a new game which was started
     */
    handleGameStarted(): any { }
    /**
     * Handles a resumed game
     */
    handleGameResumed(): any { }
    /**
     * Handles the given level completed
     */
    handleLevelCompleted(level: number): any { }
    /**
     * Handles the given upgrade completed
     */
    handleUpgradeUnlocked(id: string, level: number): any { }
    /**
     * Activates a DLC
     * @abstract
     */
    activateDlc(dlc: string): any {
        abstract;
        return Promise.resolve();
    }
}
