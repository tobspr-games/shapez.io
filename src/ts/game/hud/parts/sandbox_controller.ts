import { queryParamOptions } from "../../../core/query_parameters";
import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { enumNotificationType } from "./notifications";
export class HUDSandboxController extends BaseHUDPart {
    createElements(parent: any): any {
        this.element = makeDiv(parent, "ingame_HUD_SandboxController", [], `
            <label>Sandbox Options</label>
            <span class="sandboxHint">Use F6 to toggle this overlay</span>

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
                    <button class="styledButton maxOutAll">Max out all</button>
                </div>
            </div>
        `);
        const bind: any = (selector: any, handler: any): any => this.trackClicks(this.element.querySelector(selector), handler);
        bind(".giveBlueprints", this.giveBlueprints);
        bind(".maxOutAll", this.maxOutAll);
        bind(".levelToggle .minus", (): any => this.modifyLevel(-1));
        bind(".levelToggle .plus", (): any => this.modifyLevel(1));
        bind(".upgradesBelt .minus", (): any => this.modifyUpgrade("belt", -1));
        bind(".upgradesBelt .plus", (): any => this.modifyUpgrade("belt", 1));
        bind(".upgradesExtraction .minus", (): any => this.modifyUpgrade("miner", -1));
        bind(".upgradesExtraction .plus", (): any => this.modifyUpgrade("miner", 1));
        bind(".upgradesProcessing .minus", (): any => this.modifyUpgrade("processors", -1));
        bind(".upgradesProcessing .plus", (): any => this.modifyUpgrade("processors", 1));
        bind(".upgradesPainting .minus", (): any => this.modifyUpgrade("painting", -1));
        bind(".upgradesPainting .plus", (): any => this.modifyUpgrade("painting", 1));
    }
    giveBlueprints(): any {
        const shape: any = this.root.gameMode.getBlueprintShapeKey();
        if (!this.root.hubGoals.storedShapes[shape]) {
            this.root.hubGoals.storedShapes[shape] = 0;
        }
        this.root.hubGoals.storedShapes[shape] += 1e9;
    }
    maxOutAll(): any {
        this.modifyUpgrade("belt", 100);
        this.modifyUpgrade("miner", 100);
        this.modifyUpgrade("processors", 100);
        this.modifyUpgrade("painting", 100);
    }
    modifyUpgrade(id: any, amount: any): any {
        const upgradeTiers: any = this.root.gameMode.getUpgrades()[id];
        const maxLevel: any = upgradeTiers.length;
        this.root.hubGoals.upgradeLevels[id] = Math.max(0, Math.min(maxLevel, (this.root.hubGoals.upgradeLevels[id] || 0) + amount));
        // Compute improvement
        let improvement: any = 1;
        for (let i: any = 0; i < this.root.hubGoals.upgradeLevels[id]; ++i) {
            improvement += upgradeTiers[i].improvement;
        }
        this.root.hubGoals.upgradeImprovements[id] = improvement;
        this.root.signals.upgradePurchased.dispatch(id);
        this.root.hud.signals.notification.dispatch("Upgrade '" + id + "' is now at tier " + (this.root.hubGoals.upgradeLevels[id] + 1), enumNotificationType.upgrade);
    }
    modifyLevel(amount: any): any {
        const hubGoals: any = this.root.hubGoals;
        hubGoals.level = Math.max(1, hubGoals.level + amount);
        hubGoals.computeNextGoal();
        // Clear all shapes of this level
        hubGoals.storedShapes[hubGoals.currentGoal.definition.getHash()] = 0;
        if (this.root.hud.parts.pinnedShapes) {
            this.root.hud.parts.pinnedShapes.rerenderFull();
        }
        // Compute gained rewards
        hubGoals.gainedRewards = {};
        const levels: any = this.root.gameMode.getLevelDefinitions();
        for (let i: any = 0; i < hubGoals.level - 1; ++i) {
            if (i < levels.length) {
                const reward: any = levels[i].reward;
                hubGoals.gainedRewards[reward] = (hubGoals.gainedRewards[reward] || 0) + 1;
            }
        }
        this.root.hud.signals.notification.dispatch("Changed level to " + hubGoals.level, enumNotificationType.upgrade);
    }
    initialize(): any {
        // Allow toggling the controller overlay
        this.root.gameState.inputReciever.keydown.add((key: any): any => {
            if (key.keyCode === 117) {
                // F6
                this.toggle();
            }
        });
        this.visible = false;
        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }
    toggle(): any {
        this.visible = !this.visible;
    }
    update(): any {
        this.domAttach.update(this.visible);
    }
}
