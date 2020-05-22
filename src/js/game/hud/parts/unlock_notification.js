import { globalConfig } from "../../../core/config";
import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { makeDiv } from "../../../core/utils";
import { SOUNDS } from "../../../platform/sound";
import { MetaCutterBuilding } from "../../buildings/cutter";
import { MetaMixerBuilding } from "../../buildings/mixer";
import { MetaPainterBuilding } from "../../buildings/painter";
import { MetaRotaterBuilding } from "../../buildings/rotater";
import { MetaSplitterBuilding } from "../../buildings/splitter";
import { MetaStackerBuilding } from "../../buildings/stacker";
import { MetaTrashBuilding } from "../../buildings/trash";
import { MetaUndergroundBeltBuilding } from "../../buildings/underground_belt";
import { enumHubGoalRewards } from "../../tutorial_goals";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { T } from "../../../translations";

export class HUDUnlockNotification extends BaseHUDPart {
    initialize() {
        this.visible = false;

        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            timeToKeepSeconds: 0,
        });

        if (!(G_IS_DEV && globalConfig.debug.disableUnlockDialog)) {
            this.root.signals.storyGoalCompleted.add(this.showForLevel, this);
        }
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

        const rewardText = T.storyRewards[reward];

        let html =
            "<span class='reward'>" +
            T.ingame.levelCompleteNotification.unlockText.replace("<reward>", rewardText) +
            "</span>";

        const addBuildingExplanation = metaBuildingClass => {
            const metaBuilding = gMetaBuildingRegistry.findByClass(metaBuildingClass);
            html += `<div class="buildingExplanation" data-icon="building_tutorials/${metaBuilding.getId()}.png"></div>`;
        };

        switch (reward) {
            case enumHubGoalRewards.reward_cutter_and_trash: {
                addBuildingExplanation(MetaCutterBuilding);
                addBuildingExplanation(MetaTrashBuilding);
                break;
            }
            case enumHubGoalRewards.reward_mixer: {
                addBuildingExplanation(MetaMixerBuilding);
                break;
            }

            case enumHubGoalRewards.reward_painter: {
                addBuildingExplanation(MetaPainterBuilding);
                break;
            }

            case enumHubGoalRewards.reward_rotater: {
                addBuildingExplanation(MetaRotaterBuilding);
                break;
            }

            case enumHubGoalRewards.reward_splitter: {
                addBuildingExplanation(MetaSplitterBuilding);
                break;
            }

            case enumHubGoalRewards.reward_stacker: {
                addBuildingExplanation(MetaStackerBuilding);
                break;
            }

            case enumHubGoalRewards.reward_tunnel: {
                addBuildingExplanation(MetaUndergroundBeltBuilding);
                break;
            }
        }

        // addBuildingExplanation(MetaSplitterBuilding);
        // addBuildingExplanation(MetaCutterBuilding);

        this.elemContents.innerHTML = html;

        this.visible = true;

        this.root.soundProxy.playUi(SOUNDS.levelComplete);
    }

    requestClose() {
        this.root.app.adProvider.showVideoAd().then(() => {
            this.close();
        });
    }

    close() {
        this.visible = false;
    }

    update() {
        this.domAttach.update(this.visible);
    }
}
