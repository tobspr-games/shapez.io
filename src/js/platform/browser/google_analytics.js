import { AnalyticsInterface } from "../analytics";
import { createLogger } from "../../core/logging";

const logger = createLogger("ga");

export class GoogleAnalyticsImpl extends AnalyticsInterface {
    initialize() {
        this.lastUiClickTracked = -1000;

        setInterval(() => this.internalTrackAfkEvent(), 120 * 1000);

        // Analytics is already loaded in the html
        return Promise.resolve();
    }

    setUserContext(userName) {
        try {
            if (window.gtag) {
                logger.log("📊 Setting user context:", userName);
                window.gtag("set", {
                    player: userName,
                });
            }
        } catch (ex) {
            logger.warn("📊 Failed to set user context:", ex);
        }
    }

    trackStateEnter(stateId) {
        const nonInteractionStates = [
            "LoginState",
            "MainMenuState",
            "PreloadState",
            "RegisterState",
            "WatchAdState",
        ];

        try {
            if (window.gtag) {
                logger.log("📊 Tracking state enter:", stateId);
                window.gtag("event", "enter_state", {
                    event_category: "ui",
                    event_label: stateId,
                    non_interaction: nonInteractionStates.indexOf(stateId) >= 0,
                });
            }
        } catch (ex) {
            logger.warn("📊 Failed to track state analytcis:", ex);
        }
    }

    trackDecision(decisionName) {
        try {
            if (window.gtag) {
                logger.log("📊 Tracking decision:", decisionName);
                window.gtag("event", "decision", {
                    event_category: "ui",
                    event_label: decisionName,
                    non_interaction: true,
                });
            }
        } catch (ex) {
            logger.warn("📊 Failed to track state analytcis:", ex);
        }
    }

    trackUiClick(elementName) {
        const stateKey = this.app.stateMgr.getCurrentState().key;
        const fullSelector = stateKey + ">" + elementName;

        try {
            if (window.gtag) {
                logger.log("📊 Tracking click on:", fullSelector);
                window.gtag("event", "click", {
                    event_category: "ui",
                    event_label: fullSelector,
                });
            }
        } catch (ex) {
            logger.warn("📊 Failed to track ui click:", ex);
        }
    }

    /**
     * Tracks an event so GA keeps track of the user
     */
    internalTrackAfkEvent() {
        if (window.gtag) {
            window.gtag("event", "afk", {
                event_category: "ping",
                event_label: "timed",
            });
        }
    }
}
