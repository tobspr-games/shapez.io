import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, removeAllChildren, formatBigNumber } from "../../../core/utils";
import { UPGRADES, TIER_LABELS } from "../../upgrades";
import { ShapeDefinition } from "../../shape_definition";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { InputReceiver } from "../../../core/input_receiver";
import { KeyActionMapper } from "../../key_action_mapper";
import { Math_min } from "../../../core/builtins";
import { ClickDetector } from "../../../core/click_detector";

export class HUDShop extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_Shop", ["ingameDialog"]);

        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], `Upgrades`);
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);
        this.contentDiv = makeDiv(this.dialogInner, null, ["content"]);

        this.upgradeToElements = {};

        // Upgrades
        for (const upgradeId in UPGRADES) {
            const { label } = UPGRADES[upgradeId];
            const handle = {};
            handle.requireIndexToElement = [];

            // Wrapper
            handle.elem = makeDiv(this.contentDiv, null, ["upgrade"]);
            handle.elem.setAttribute("data-upgrade-id", upgradeId);

            // Title
            const title = makeDiv(handle.elem, null, ["title"], label);

            // Title > Tier
            handle.elemTierLabel = makeDiv(title, null, ["tier"], "Tier ?");

            // Icon
            handle.icon = makeDiv(handle.elem, null, ["icon"]);
            handle.icon.setAttribute("data-icon", "upgrades/" + upgradeId + ".png");

            // Description
            handle.elemDescription = makeDiv(handle.elem, null, ["description"], "??");
            handle.elemRequirements = makeDiv(handle.elem, null, ["requirements"]);

            // Buy button
            handle.buyButton = document.createElement("button");
            handle.buyButton.classList.add("buy", "styledButton");
            handle.buyButton.innerText = "Upgrade";
            handle.elem.appendChild(handle.buyButton);

            this.trackClicks(handle.buyButton, () => this.tryUnlockNextTier(upgradeId));

            // Assign handle
            this.upgradeToElements[upgradeId] = handle;
        }
    }

    rerenderFull() {
        for (const upgradeId in this.upgradeToElements) {
            const handle = this.upgradeToElements[upgradeId];
            const { description, tiers } = UPGRADES[upgradeId];

            const currentTier = this.root.hubGoals.getUpgradeLevel(upgradeId);
            const tierHandle = tiers[currentTier];

            // Set tier
            handle.elemTierLabel.innerText = "Tier " + TIER_LABELS[currentTier];
            handle.elemTierLabel.setAttribute("data-tier", currentTier);

            // Cleanup detectors
            for (let i = 0; i < handle.requireIndexToElement.length; ++i) {
                const requiredHandle = handle.requireIndexToElement[i];
                requiredHandle.container.remove();
                requiredHandle.pinDetector.cleanup();
            }

            // Cleanup
            handle.requireIndexToElement = [];

            handle.elem.classList.toggle("maxLevel", !tierHandle);

            if (!tierHandle) {
                // Max level
                handle.elemDescription.innerText = "Maximum level";
                continue;
            }

            // Set description
            handle.elemDescription.innerText = description(tierHandle.improvement);

            tierHandle.required.forEach(({ shape, amount }) => {
                const container = makeDiv(handle.elemRequirements, null, ["requirement"]);

                const shapeDef = this.root.shapeDefinitionMgr.getShapeFromShortKey(shape);
                const shapeCanvas = shapeDef.generateAsCanvas(120);
                shapeCanvas.classList.add();
                container.appendChild(shapeCanvas);

                const progressContainer = makeDiv(container, null, ["amount"]);
                const progressBar = document.createElement("label");
                progressBar.classList.add("progressBar");
                progressContainer.appendChild(progressBar);

                const progressLabel = document.createElement("label");
                progressContainer.appendChild(progressLabel);

                const pinButton = document.createElement("button");
                pinButton.classList.add("pin");
                container.appendChild(pinButton);

                if (this.root.hud.parts.pinnedShapes.isShapePinned(shape)) {
                    console.log("ALREADY PINNED:", shape);
                    pinButton.classList.add("alreadyPinned");
                }

                const pinDetector = new ClickDetector(pinButton, {
                    consumeEvents: true,
                    preventDefault: true,
                });
                pinDetector.click.add(() => {
                    this.root.hud.signals.shapePinRequested.dispatch(shapeDef);
                    pinButton.classList.add("pinned");
                });

                handle.requireIndexToElement.push({
                    container,
                    progressLabel,
                    progressBar,
                    definition: shapeDef,
                    required: amount,
                    pinDetector,
                });
            });
        }
    }

    renderCountsAndStatus() {
        for (const upgradeId in this.upgradeToElements) {
            const handle = this.upgradeToElements[upgradeId];
            for (let i = 0; i < handle.requireIndexToElement.length; ++i) {
                const { progressLabel, progressBar, definition, required } = handle.requireIndexToElement[i];

                const haveAmount = this.root.hubGoals.getShapesStored(definition);
                const progress = Math_min(haveAmount / required, 1.0);

                progressLabel.innerText = formatBigNumber(haveAmount) + " / " + formatBigNumber(required);
                progressBar.style.width = progress * 100.0 + "%";
                progressBar.classList.toggle("complete", progress >= 1.0);
            }

            handle.buyButton.classList.toggle("buyable", this.root.hubGoals.canUnlockUpgrade(upgradeId));
        }
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("shop");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        this.keyActionMapper.getBinding("back").add(this.close, this);
        this.keyActionMapper.getBinding("menu_open_shop").add(this.close, this);

        this.close();

        this.rerenderFull();
        this.root.signals.upgradePurchased.add(this.rerenderFull, this);
    }

    cleanup() {
        document.body.classList.remove("ingameDialogOpen");

        // Cleanup detectors
        for (const upgradeId in this.upgradeToElements) {
            const handle = this.upgradeToElements[upgradeId];
            for (let i = 0; i < handle.requireIndexToElement.length; ++i) {
                const requiredHandle = handle.requireIndexToElement[i];
                requiredHandle.container.remove();
                requiredHandle.pinDetector.cleanup();
            }
            handle.requireIndexToElement = [];
        }
    }

    show() {
        this.visible = true;
        document.body.classList.add("ingameDialogOpen");
        // this.background.classList.add("visible");
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.rerenderFull();
    }

    close() {
        this.visible = false;
        document.body.classList.remove("ingameDialogOpen");
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    update() {
        this.domAttach.update(this.visible);
        if (this.visible) {
            this.renderCountsAndStatus();
        }
    }

    tryUnlockNextTier(upgradeId) {
        // Nothing
        this.root.hubGoals.tryUnlockUgprade(upgradeId);
    }
}
