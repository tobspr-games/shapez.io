import { ClickDetector } from "../../../core/click_detector";
import { InputReceiver } from "../../../core/input_receiver";
import { formatBigNumber, getRomanNumber, makeDiv } from "../../../core/utils";
import { SOUNDS } from "../../../platform/sound";
import { T } from "../../../translations";
import { KeyActionMapper, KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
export class HUDShop extends BaseHUDPart {
    createElements(parent: any): any {
        this.background = makeDiv(parent, "ingame_HUD_Shop", ["ingameDialog"]);
        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], T.ingame.shop.title);
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);
        this.contentDiv = makeDiv(this.dialogInner, null, ["content"]);
        this.upgradeToElements = {};
        // Upgrades
        for (const upgradeId: any in this.root.gameMode.getUpgrades()) {
            const handle: any = {};
            handle.requireIndexToElement = [];
            // Wrapper
            handle.elem = makeDiv(this.contentDiv, null, ["upgrade"]);
            handle.elem.setAttribute("data-upgrade-id", upgradeId);
            // Title
            const title: any = makeDiv(handle.elem, null, ["title"], T.shopUpgrades[upgradeId].name);
            // Title > Tier
            handle.elemTierLabel = makeDiv(title, null, ["tier"]);
            // Icon
            handle.icon = makeDiv(handle.elem, null, ["icon"]);
            handle.icon.setAttribute("data-icon", "upgrades/" + upgradeId + ".png");
            // Description
            handle.elemDescription = makeDiv(handle.elem, null, ["description"], "??");
            handle.elemRequirements = makeDiv(handle.elem, null, ["requirements"]);
            // Buy button
            handle.buyButton = document.createElement("button");
            handle.buyButton.classList.add("buy", "styledButton");
            handle.buyButton.innerText = T.ingame.shop.buttonUnlock;
            handle.elem.appendChild(handle.buyButton);
            this.trackClicks(handle.buyButton, (): any => this.tryUnlockNextTier(upgradeId));
            // Assign handle
            this.upgradeToElements[upgradeId] = handle;
        }
    }
    rerenderFull(): any {
        for (const upgradeId: any in this.upgradeToElements) {
            const handle: any = this.upgradeToElements[upgradeId];
            const upgradeTiers: any = this.root.gameMode.getUpgrades()[upgradeId];
            const currentTier: any = this.root.hubGoals.getUpgradeLevel(upgradeId);
            const currentTierMultiplier: any = this.root.hubGoals.upgradeImprovements[upgradeId];
            const tierHandle: any = upgradeTiers[currentTier];
            // Set tier
            handle.elemTierLabel.innerText = T.ingame.shop.tier.replace("<x>", getRomanNumber(currentTier + 1));
            handle.elemTierLabel.setAttribute("data-tier", currentTier);
            // Cleanup detectors
            for (let i: any = 0; i < handle.requireIndexToElement.length; ++i) {
                const requiredHandle: any = handle.requireIndexToElement[i];
                requiredHandle.container.remove();
                requiredHandle.pinDetector.cleanup();
                if (requiredHandle.infoDetector) {
                    requiredHandle.infoDetector.cleanup();
                }
            }
            // Cleanup
            handle.requireIndexToElement = [];
            handle.elem.classList.toggle("maxLevel", !tierHandle);
            if (!tierHandle) {
                // Max level
                handle.elemDescription.innerText = T.ingame.shop.maximumLevel.replace("<currentMult>", formatBigNumber(currentTierMultiplier));
                continue;
            }
            // Set description
            handle.elemDescription.innerText = T.shopUpgrades[upgradeId].description
                .replace("<currentMult>", currentTierMultiplier.toFixed(2))
                .replace("<newMult>", (currentTierMultiplier + tierHandle.improvement).toFixed(2));
            tierHandle.required.forEach(({ shape, amount }: any): any => {
                const container: any = makeDiv(handle.elemRequirements, null, ["requirement"]);
                const shapeDef: any = this.root.shapeDefinitionMgr.getShapeFromShortKey(shape);
                const shapeCanvas: any = shapeDef.generateAsCanvas(120);
                shapeCanvas.classList.add();
                container.appendChild(shapeCanvas);
                const progressContainer: any = makeDiv(container, null, ["amount"]);
                const progressBar: any = document.createElement("label");
                progressBar.classList.add("progressBar");
                progressContainer.appendChild(progressBar);
                const progressLabel: any = document.createElement("label");
                progressContainer.appendChild(progressLabel);
                const pinButton: any = document.createElement("button");
                pinButton.classList.add("pin");
                container.appendChild(pinButton);
                let infoDetector: any;
                const viewInfoButton: any = document.createElement("button");
                viewInfoButton.classList.add("showInfo");
                container.appendChild(viewInfoButton);
                infoDetector = new ClickDetector(viewInfoButton, {
                    consumeEvents: true,
                    preventDefault: true,
                });
                infoDetector.click.add((): any => this.root.hud.signals.viewShapeDetailsRequested.dispatch(shapeDef));
                const currentGoalShape: any = this.root.hubGoals.currentGoal.definition.getHash();
                if (shape === currentGoalShape) {
                    pinButton.classList.add("isGoal");
                }
                else if (this.root.hud.parts.pinnedShapes.isShapePinned(shape)) {
                    pinButton.classList.add("alreadyPinned");
                }
                const pinDetector: any = new ClickDetector(pinButton, {
                    consumeEvents: true,
                    preventDefault: true,
                });
                pinDetector.click.add((): any => {
                    if (this.root.hud.parts.pinnedShapes.isShapePinned(shape)) {
                        this.root.hud.signals.shapeUnpinRequested.dispatch(shape);
                        pinButton.classList.add("unpinned");
                        pinButton.classList.remove("pinned", "alreadyPinned");
                    }
                    else {
                        this.root.hud.signals.shapePinRequested.dispatch(shapeDef);
                        pinButton.classList.add("pinned");
                        pinButton.classList.remove("unpinned");
                    }
                });
                handle.requireIndexToElement.push({
                    container,
                    progressLabel,
                    progressBar,
                    definition: shapeDef,
                    required: amount,
                    pinDetector,
                    infoDetector,
                });
            });
        }
    }
    renderCountsAndStatus(): any {
        for (const upgradeId: any in this.upgradeToElements) {
            const handle: any = this.upgradeToElements[upgradeId];
            for (let i: any = 0; i < handle.requireIndexToElement.length; ++i) {
                const { progressLabel, progressBar, definition, required }: any = handle.requireIndexToElement[i];
                const haveAmount: any = this.root.hubGoals.getShapesStored(definition);
                const progress: any = Math.min(haveAmount / required, 1.0);
                progressLabel.innerText = formatBigNumber(haveAmount) + " / " + formatBigNumber(required);
                progressBar.style.width = progress * 100.0 + "%";
                progressBar.classList.toggle("complete", progress >= 1.0);
            }
            handle.buyButton.classList.toggle("buyable", this.root.hubGoals.canUnlockUpgrade(upgradeId));
        }
    }
    initialize(): any {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });
        this.inputReciever = new InputReceiver("shop");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);
        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.ingame.menuClose).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.ingame.menuOpenShop).add(this.close, this);
        this.close();
        this.rerenderFull();
        this.root.signals.upgradePurchased.add(this.rerenderFull, this);
    }
    cleanup(): any {
        // Cleanup detectors
        for (const upgradeId: any in this.upgradeToElements) {
            const handle: any = this.upgradeToElements[upgradeId];
            for (let i: any = 0; i < handle.requireIndexToElement.length; ++i) {
                const requiredHandle: any = handle.requireIndexToElement[i];
                requiredHandle.container.remove();
                requiredHandle.pinDetector.cleanup();
                if (requiredHandle.infoDetector) {
                    requiredHandle.infoDetector.cleanup();
                }
            }
            handle.requireIndexToElement = [];
        }
    }
    show(): any {
        this.visible = true;
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.rerenderFull();
    }
    close(): any {
        this.visible = false;
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }
    update(): any {
        this.domAttach.update(this.visible);
        if (this.visible) {
            this.renderCountsAndStatus();
        }
    }
    tryUnlockNextTier(upgradeId: any): any {
        if (this.root.hubGoals.tryUnlockUpgrade(upgradeId)) {
            this.root.app.sound.playUiSound(SOUNDS.unlockUpgrade);
        }
    }
    isBlockingOverlay(): any {
        return this.visible;
    }
}
