import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { GameRoot } from "../../root";
import { MinerComponent } from "../../components/miner";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { TrackedState } from "../../../core/tracked_state";
import { cachebust } from "../../../core/cachebust";
import { T } from "../../../translations";

const tutorialsByLevel = [
    // Level 1
    [
        // 1.1. place an extractor
        {
            id: "1_1_extractor",
            condition: /** @param {GameRoot} root */ root => {
                return root.entityMgr.getAllWithComponent(MinerComponent).length === 0;
            },
        },
        // 1.2. connect to hub
        {
            id: "1_2_conveyor",
            condition: /** @param {GameRoot} root */ root => {
                return root.hubGoals.getCurrentGoalDelivered() === 0;
            },
        },
        // 1.3 wait for completion
        {
            id: "1_3_expand",
            condition: () => true,
        },
    ],
];

export class HUDInteractiveTutorial extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_InteractiveTutorial",
            ["animEven"],
            `
            <strong class="title">${T.ingame.interactiveTutorial.title}</strong>
            `
        );

        this.elementDescription = makeDiv(this.element, null, ["desc"]);
        this.elementGif = makeDiv(this.element, null, ["helperGif"]);
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.element);
        this.currentHintId = new TrackedState(this.onHintChanged, this);
    }

    onHintChanged(hintId) {
        this.elementDescription.innerHTML = T.ingame.interactiveTutorial.hints[hintId];
        this.elementGif.style.backgroundImage =
            "url('" + cachebust("res/ui/interactive_tutorial.noinline/" + hintId + ".gif") + "')";
        this.element.classList.toggle("animEven");
        this.element.classList.toggle("animOdd");
    }

    update() {
        // Compute current hint
        const thisLevelHints = tutorialsByLevel[this.root.hubGoals.level - 1];
        let targetHintId = null;

        if (thisLevelHints) {
            for (let i = 0; i < thisLevelHints.length; ++i) {
                const hint = thisLevelHints[i];
                if (hint.condition(this.root)) {
                    targetHintId = hint.id;
                    break;
                }
            }
        }

        this.currentHintId.set(targetHintId);
        this.domAttach.update(!!targetHintId);
    }
}
