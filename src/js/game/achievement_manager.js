/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";

const logger = createLogger("achievement_manager");

export class AchievementManager {
    static getId() {
        return "AchievementManager";
    }

    constructor(root) {
        this.root = root;
        this.achievements = null;

        if (!this.root.app.achievements.hasAchievements()) {
            logger.debug("Bypassing achievement set up");
            // Set adhoc checks to reference a noop, ignore signals.
            return;
        }

        this.init();
    }

    init () {
        return this.root.app.achievements.load()
            .then(() => {
                this.achievements = this.root.app.achievements.getAchievements();

                return this.setChecks();
            })
    }

    setChecks () {
        logger.debug("loaded", this.achievements);

        // set checks on achievements

        //this.root.signals.itemProduced.add(this.onItemProduced, this);
    }

    /**
     * @param {BaseItem} item
     */
    onItemProduced(item) {
        logger.debug(item);
    }

    // Have one check function per achievement
    isPainted () {
        return 
    }
}
