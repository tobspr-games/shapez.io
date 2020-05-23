import { globalConfig } from "../../../core/config";
import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { makeDiv } from "../../../core/utils";
import { SOUNDS } from "../../../platform/sound";
import { T } from "../../../translations";
import { defaultBuildingVariant } from "../../meta_building";
import { enumHubGoalRewards, enumHubGoalRewardsToContentUnlocked } from "../../tutorial_goals";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDUnlockNotification extends BaseHUDPart {
    initialize() {
        this.visible = false;

        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            timeToKeepSeconds: 0,
        });

        if (!(G_IS_DEV && globalConfig.debug.disableUnlockDialog)) {
            this.root.signals.storyGoalCompleted.add(this.showForLevel, this);
        }

        this.buttonShowTimeout = null;
    }

    shouldPauseGame() {
        return this.visible;
    }

    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_UnlockNotification", []);

        const dialog = makeDiv(this.element, null, ["dialog"]);

        this.elemTitle = makeDiv(dialog, null, ["title"]);
        this.elemSubTitle = makeDiv(dialog, null, ["subTitle"], T.ingame.levelCompleteNotification.completed);

        this.elemContents = makeDiv(dialog, null, ["contents"]);

        this.btnClose = document.createElement("button");
        this.btnClose.classList.add("close", "styledButton");
        this.btnClose.innerText = "Next level";
        dialog.appendChild(this.btnClose);

        this.trackClicks(this.btnClose, this.requestClose);
    }

    /**
     * @param {number} level
     * @param {enumHubGoalRewards} reward
     */
    showForLevel(level, reward) {
        this.elemTitle.innerText = T.ingame.levelCompleteNotification.levelTitle.replace(
            "<level>",
            ("" + level).padStart(2, "0")
        );

        const rewardName = T.storyRewards[reward].title;

        let html = `
        <div class="rewardName">
            ${T.ingame.levelCompleteNotification.unlockText.replace("<reward>", rewardName)}
        </div>
        
        <div class="rewardDesc">
            ${T.storyRewards[reward].desc}
        </div>

        `;

        html += "<div class='images'>";
        const gained = enumHubGoalRewardsToContentUnlocked[reward];
        if (gained) {
            gained.forEach(([metaBuildingClass, variant]) => {
                const metaBuilding = gMetaBuildingRegistry.findByClass(metaBuildingClass);
                html += `<div class="buildingExplanation" data-icon="building_tutorials/${
                    metaBuilding.getId() + (variant === defaultBuildingVariant ? "" : "-" + variant)
                }.png"></div>`;
            });
        }
        html += "</div>";

        this.elemContents.innerHTML = html;
        this.visible = true;
        this.root.soundProxy.playUi(SOUNDS.levelComplete);

        if (this.buttonShowTimeout) {
            clearTimeout(this.buttonShowTimeout);
        }

        this.buttonShowTimeout = setTimeout(
            () => this.element.querySelector("button.close").classList.add("unlocked"),
            G_IS_DEV ? 1000 : 10000
        );
    }

    cleanup() {
        if (this.buttonShowTimeout) {
            clearTimeout(this.buttonShowTimeout);
            this.buttonShowTimeout = null;
        }
    }

    requestClose() {
        this.root.app.adProvider.showVideoAd().then(() => {
            this.close();
        });
    }

    close() {
        if (this.buttonShowTimeout) {
            clearTimeout(this.buttonShowTimeout);
            this.buttonShowTimeout = null;
        }
        this.visible = false;
    }

    update() {
        this.domAttach.update(this.visible);
        if (!this.visible && this.buttonShowTimeout) {
            clearTimeout(this.buttonShowTimeout);
            this.buttonShowTimeout = null;
        }
    }
}
