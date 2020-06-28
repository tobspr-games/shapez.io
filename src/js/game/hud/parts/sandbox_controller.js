import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { blueprintShape, UPGRADES } from "../../upgrades";
import { enumNotificationType } from "./notifications";

export class HUDSandboxController extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_SandboxController",
            [],
            `
            <label>Sandbox Options</label>
            <span class="hint">Use F6 to toggle this overlay</span>

            <div class="buttons">
                <div class="levelToggle plusMinus">
                    <label>Level</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>
                
                <div class="upgradesBelt plusMinus">
                    <label>Upgrades &rarr; Belt</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>
                
                <div class="upgradesExtraction plusMinus">
                    <label>Upgrades &rarr; Extraction</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>
                
                <div class="upgradesProcessing plusMinus">
                    <label>Upgrades &rarr; Processing</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>
                
                <div class="upgradesPainting plusMinus">
                    <label>Upgrades &rarr; Painting</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>

                <div class="additionalOptions">
                    <button class="styledButton giveBlueprints">Fill blueprint shapes</button>
                </div>
            </div>
        `
        );

        const bind = (selector, handler) => this.trackClicks(this.element.querySelector(selector), handler);

        bind(".giveBlueprints", this.giveBlueprints);
        bind(".levelToggle .minus", () => this.modifyLevel(-1));
        bind(".levelToggle .plus", () => this.modifyLevel(1));

        bind(".upgradesBelt .minus", () => this.modifyUpgrade("belt", -1));
        bind(".upgradesBelt .plus", () => this.modifyUpgrade("belt", 1));

        bind(".upgradesExtraction .minus", () => this.modifyUpgrade("miner", -1));
        bind(".upgradesExtraction .plus", () => this.modifyUpgrade("miner", 1));

        bind(".upgradesProcessing .minus", () => this.modifyUpgrade("processors", -1));
        bind(".upgradesProcessing .plus", () => this.modifyUpgrade("processors", 1));

        bind(".upgradesPainting .minus", () => this.modifyUpgrade("painting", -1));
        bind(".upgradesPainting .plus", () => this.modifyUpgrade("painting", 1));
    }

    giveBlueprints() {
        this.root.hubGoals.storedShapes[blueprintShape] += 1e4;
    }

    modifyUpgrade(id, amount) {
        const handle = UPGRADES[id];
        const maxLevel = handle.tiers.length;

        this.root.hubGoals.upgradeLevels[id] = Math.max(
            0,
            Math.min(maxLevel, (this.root.hubGoals.upgradeLevels[id] || 0) + amount)
        );

        // Compute improvement
        let improvement = 1;
        for (let i = 0; i < this.root.hubGoals.upgradeLevels[id]; ++i) {
            improvement += handle.tiers[i].improvement;
        }
        this.root.hubGoals.upgradeImprovements[id] = improvement;
        this.root.signals.upgradePurchased.dispatch(id);
        this.root.hud.signals.notification.dispatch(
            "Upgrade '" + id + "' is now at level " + this.root.hubGoals.upgradeLevels[id],
            enumNotificationType.upgrade
        );
    }

    modifyLevel(amount) {
        this.root.hubGoals.level = Math.max(1, this.root.hubGoals.level + amount);
        this.root.hubGoals.createNextGoal();

        // Clear all shapes of this level
        this.root.hubGoals.storedShapes[this.root.hubGoals.currentGoal.definition.getHash()] = 0;

        this.root.hud.signals.notification.dispatch(
            "Changed level to " + this.root.hubGoals.level,
            enumNotificationType.upgrade
        );
    }

    initialize() {
        // Allow toggling the controller overlay
        this.root.gameState.inputReciever.keydown.add(key => {
            if (key.keyCode === 117) {
                // F6
                this.toggle();
            }
        });

        this.visible = true;
        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }

    toggle() {
        this.visible = !this.visible;
    }

    update() {
        this.domAttach.update(this.visible);
    }
}
