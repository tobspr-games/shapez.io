import { TextualGameState } from "../core/textual_game_state";
import { makeDiv } from "../core/utils";
import {
    ACHIEVEMENTS,
    enum_achievement_mappings,
    HIDDEN_ACHIEVEMENTS,
} from "../platform/achievement_provider";
import { T } from "../translations";

export class AchievementsState extends TextualGameState {
    constructor() {
        super("AchievementsState");
    }

    getStateHeaderTitle() {
        return T.ingame.achievements.title;
    }

    onEnter(payload) {
        this.app.achievementProvider.unlockUnlocked();

        this.parent = makeDiv(document.querySelector(".content.mainContent"), "ingame_HUD_Achievements", [
            "ingameDialog",
        ]);
        this.contentDiv = makeDiv(this.parent, null, ["content"]);
        this.achievementToElements = {};

        // ACHIEVEMENTS
        for (const achievementKey in ACHIEVEMENTS) {
            const handle = {};

            // Wrapper
            handle.elem = makeDiv(this.contentDiv, null, ["achievement"]);

            // Icon
            handle.icon = makeDiv(handle.elem, null, ["icon"]);
            handle.icon.setAttribute("data-icon", "achievements/" + achievementKey + ".png");

            // Info
            handle.info = makeDiv(handle.elem, null, ["info"]);

            // Title
            const title = makeDiv(handle.info, null, ["title"], T.achievements[achievementKey].title);

            // Description
            handle.elemDescription = makeDiv(
                handle.info,
                null,
                ["description"],
                T.achievements[achievementKey].description
            );

            // Reset button
            handle.resetButton = document.createElement("button");
            handle.resetButton.classList.add("reset", "styledButton");
            handle.resetButton.innerText = T.ingame.achievements.buttonReset;
            handle.elem.appendChild(handle.resetButton);

            this.trackClicks(handle.resetButton, () => {
                this.app.achievementProvider.collection.lock(
                    achievementKey,
                    enum_achievement_mappings[ACHIEVEMENTS[achievementKey]]
                );
            });

            // Assign handle
            this.achievementToElements[achievementKey] = handle;
        }

        this.hiddenElement = {};
        // Wrapper
        this.hiddenElement.hidden = makeDiv(this.contentDiv, null, ["achievement"]);

        // Icon
        this.hiddenElement.icon = makeDiv(this.hiddenElement.hidden, null, ["icon"]);
        this.hiddenElement.icon.setAttribute("data-icon", "achievements/hidden.png");

        // Info
        this.hiddenElement.info = makeDiv(this.hiddenElement.hidden, null, ["info"]);

        // Title
        this.hiddenElement.title = makeDiv(
            this.hiddenElement.info,
            null,
            ["title"],
            T.achievements.hidden.title
        );

        // Description
        this.hiddenElement.description = makeDiv(
            this.hiddenElement.info,
            null,
            ["description"],
            T.achievements.hidden.description.replace("<amountHidden>", HIDDEN_ACHIEVEMENTS.length + "")
        );

        this.resetElement = {};

        // Wrapper
        this.resetElement.elem = makeDiv(this.contentDiv, null, ["achievement", "reset", "unlocked"]);

        // Icon
        this.resetElement.icon = makeDiv(this.resetElement.elem, null, ["icon"]);
        this.resetElement.icon.setAttribute("data-icon", "achievements/reset.png");

        // Info
        this.resetElement.info = makeDiv(this.resetElement.elem, null, ["info"]);

        // Title
        this.resetElement.title = makeDiv(
            this.resetElement.info,
            null,
            ["title"],
            T.achievements.reset.title
        );

        // Description
        this.resetElement.description = makeDiv(
            this.resetElement.info,
            null,
            ["description"],
            T.achievements.reset.description
        );

        // Reset button
        this.resetElement.resetButton = document.createElement("button");
        this.resetElement.resetButton.classList.add("reset", "styledButton");
        this.resetElement.resetButton.innerText = T.ingame.achievements.buttonReset;
        this.resetElement.elem.appendChild(this.resetElement.resetButton);
        this.trackClicks(this.resetElement.resetButton, () => {
            const signals = this.dialogs.showWarning(
                T.dialogs.resetAchievements.title,
                T.dialogs.resetAchievements.description,
                ["cancel:bad:escape", "ok:good:enter"]
            );
            signals.ok.add(() => {
                for (const achievementKey in ACHIEVEMENTS) {
                    if (!this.app.achievementProvider.collection.map.has(achievementKey))
                        this.app.achievementProvider.collection.lock(
                            achievementKey,
                            enum_achievement_mappings[ACHIEVEMENTS[achievementKey]]
                        );
                }
            });
        });
    }

    onRender(dt) {
        let unlocked = 0;
        let hidden = 0;
        for (const achievementKey in this.achievementToElements) {
            const handle = this.achievementToElements[achievementKey];

            //Check if user has achievement
            if (!this.app.achievementProvider.collection.map.get(ACHIEVEMENTS[achievementKey])) {
                if (!handle.elem.classList.contains("unlocked")) handle.elem.classList.add("unlocked");
                if (handle.elem.classList.contains("hidden")) handle.elem.classList.remove("hidden");
                unlocked++;
            } else {
                if (handle.elem.classList.contains("unlocked")) handle.elem.classList.remove("unlocked");

                if (HIDDEN_ACHIEVEMENTS.includes(ACHIEVEMENTS[achievementKey])) {
                    if (!handle.elem.classList.contains("hidden")) handle.elem.classList.add("hidden");
                    hidden++;
                }
            }
        }

        this.hiddenElement.description.innerHTML = T.achievements.hidden.description.replace(
            "<amountHidden>",
            hidden + ""
        );

        if (unlocked > 0) {
            if (!this.resetElement.elem.classList.contains("unlocked"))
                this.resetElement.elem.classList.add("unlocked");
        } else if (this.resetElement.elem.classList.contains("unlocked"))
            this.resetElement.elem.classList.remove("unlocked");
    }
}
