import { GameAnalyticsInterface } from "../game_analytics";

export class NoGameAnalytics extends GameAnalyticsInterface {
    initialize() {
        return Promise.resolve();
    }
}
