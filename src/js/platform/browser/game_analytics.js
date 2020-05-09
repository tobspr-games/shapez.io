import { GameAnalyticsInterface } from "../game_analytics";
import { createLogger } from "../../core/logging";
import { ShapeDefinition } from "../../game/shape_definition";
import { gameCreationAction } from "../../states/ingame";

const logger = createLogger("ga_com");

export class GameAnalyticsDotCom extends GameAnalyticsInterface {
    /**
     * @returns {Promise<void>}
     */
    initialize() {
        try {
            const ga = window.gameanalytics.GameAnalytics;
            ga.configureBuild(G_APP_ENVIRONMENT + "@" + G_BUILD_VERSION + "@" + G_BUILD_COMMIT_HASH);

            ga.setEnabledInfoLog(G_IS_DEV);
            ga.setEnabledVerboseLog(G_IS_DEV);

            // @ts-ignore
            ga.initialize(window.ga_comKey, window.ga_comToken);

            // start new session
            ga.startSession();
        } catch (ex) {
            logger.warn("ga_com init error:", ex);
        }
        return Promise.resolve();
    }

    /**
     * @param {ShapeDefinition} definition
     */
    handleShapeDelivered(definition) {
        const hash = definition.getHash();
        logger.log("Deliver:", hash);
    }

    /**
     * Handles the given level completed
     * @param {number} level
     */
    handleLevelCompleted(level) {
        logger.log("Complete level", level);
        try {
            const gaD = window.gameanalytics;
            const ga = gaD.GameAnalytics;
            ga.addProgressionEvent(gaD.EGAProgressionStatus.Complete, "story", "" + level);
        } catch (ex) {
            logger.error("ga_com lvl complete error:", ex);
        }
    }

    /**
     * Handles the given upgrade completed
     * @param {string} id
     * @param {number} level
     */
    handleUpgradeUnlocked(id, level) {
        logger.log("Unlock upgrade", id, level);
        try {
            const gaD = window.gameanalytics;
            const ga = gaD.GameAnalytics;
            ga.addProgressionEvent(gaD.EGAProgressionStatus.Complete, "upgrade", id, "" + level);
        } catch (ex) {
            logger.error("ga_com upgrade unlock error:", ex);
        }
    }
}
