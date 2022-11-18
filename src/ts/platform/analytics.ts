/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
export class AnalyticsInterface {
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
     * Sets the player name for analytics
     */
    setUserContext(userName: string) { }
    /**
     * Tracks when a new state is entered
     */
    trackStateEnter(stateId: string) { }
    /**
     * Tracks a new user decision
     */
    trackDecision(name: string) { }
    // LEGACY 1.5.3
    trackUiClick() { }
}
