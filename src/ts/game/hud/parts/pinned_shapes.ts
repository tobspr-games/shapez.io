import { ClickDetector } from "../../../core/click_detector";
import { globalConfig } from "../../../core/config";
import { arrayDeleteValue, formatBigNumber, makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { enumAnalyticsDataSource } from "../../production_analytics";
import { ShapeDefinition } from "../../shape_definition";
import { enumHubGoalRewards } from "../../tutorial_goals";
import { BaseHUDPart } from "../base_hud_part";
/**
 * Manages the pinned shapes on the left side of the screen
 */
export class HUDPinnedShapes extends BaseHUDPart {
    public pinnedShapes: Array<string> = [];
    public handles: Array<{
        key: string;
        definition: ShapeDefinition;
        amountLabel: HTMLElement;
        lastRenderedValue: string;
        element: HTMLElement;
        detector?: ClickDetector;
        infoDetector?: ClickDetector;
        throughputOnly?: boolean;
    }> = [];

    constructor(root) {
        super(root);
    }
    createElements(parent: any): any {
        this.element = makeDiv(parent, "ingame_HUD_PinnedShapes", []);
    }
    /**
     * Serializes the pinned shapes
     */
    serialize(): any {
        return {
            shapes: this.pinnedShapes,
        };
    }
    /**
     * Deserializes the pinned shapes
     */
    deserialize(data: {
        shapes: Array<string>;
    }): any {
        if (!data || !data.shapes || !Array.isArray(data.shapes)) {
            return "Invalid pinned shapes data: " + JSON.stringify(data);
        }
        this.pinnedShapes = data.shapes;
    }
    /**
     * Initializes the hud component
     */
    initialize(): any {
        // Connect to any relevant signals
        this.root.signals.storyGoalCompleted.add(this.rerenderFull, this);
        this.root.signals.upgradePurchased.add(this.updateShapesAfterUpgrade, this);
        this.root.signals.postLoadHook.add(this.rerenderFull, this);
        this.root.hud.signals.shapePinRequested.add(this.pinNewShape, this);
        this.root.hud.signals.shapeUnpinRequested.add(this.unpinShape, this);
        // Perform initial render
        this.updateShapesAfterUpgrade();
    }
    /**
     * Updates all shapes after an upgrade has been purchased and removes the unused ones
     */
    updateShapesAfterUpgrade(): any {
        for (let i: any = 0; i < this.pinnedShapes.length; ++i) {
            const key: any = this.pinnedShapes[i];
            if (key === this.root.gameMode.getBlueprintShapeKey()) {
                // Ignore blueprint shapes
                continue;
            }
            let goal: any = this.findGoalValueForShape(key);
            if (!goal) {
                // Seems no longer relevant
                this.pinnedShapes.splice(i, 1);
                i -= 1;
            }
        }
        this.rerenderFull();
    }
    /**
     * Finds the current goal for the given key. If the key is the story goal, returns
     * the story goal. If its the blueprint shape, no goal is returned. Otherwise
     * it's searched for upgrades.
     */
    findGoalValueForShape(key: string): any {
        if (key === this.root.hubGoals.currentGoal.definition.getHash()) {
            return this.root.hubGoals.currentGoal.required;
        }
        if (key === this.root.gameMode.getBlueprintShapeKey()) {
            return null;
        }
        // Check if this shape is required for any upgrade
        const upgrades: any = this.root.gameMode.getUpgrades();
        for (const upgradeId: any in upgrades) {
            const upgradeTiers: any = upgrades[upgradeId];
            const currentTier: any = this.root.hubGoals.getUpgradeLevel(upgradeId);
            const tierHandle: any = upgradeTiers[currentTier];
            if (!tierHandle) {
                // Max level
                continue;
            }
            for (let i: any = 0; i < tierHandle.required.length; ++i) {
                const { shape, amount }: any = tierHandle.required[i];
                if (shape === key) {
                    return amount;
                }
            }
        }
        return null;
    }
    /**
     * Returns whether a given shape is currently pinned
     */
    isShapePinned(key: string): any {
        if (key === this.root.hubGoals.currentGoal.definition.getHash() ||
            key === this.root.gameMode.getBlueprintShapeKey()) {
            // This is a "special" shape which is always pinned
            return true;
        }
        return this.pinnedShapes.indexOf(key) >= 0;
    }
    /**
     * Rerenders the whole component
     */
    rerenderFull(): any {
        const currentGoal: any = this.root.hubGoals.currentGoal;
        const currentKey: any = currentGoal.definition.getHash();
        // First, remove all old shapes
        for (let i: any = 0; i < this.handles.length; ++i) {
            this.handles[i].element.remove();
            const detector: any = this.handles[i].detector;
            if (detector) {
                detector.cleanup();
            }
            const infoDetector: any = this.handles[i].infoDetector;
            if (infoDetector) {
                infoDetector.cleanup();
            }
        }
        this.handles = [];
        // Pin story goal
        this.internalPinShape({
            key: currentKey,
            canUnpin: false,
            className: "goal",
            throughputOnly: currentGoal.throughputOnly,
        });
        // Pin blueprint shape as well
        if (this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_blueprints)) {
            this.internalPinShape({
                key: this.root.gameMode.getBlueprintShapeKey(),
                canUnpin: false,
                className: "blueprint",
            });
        }
        // Pin manually pinned shapes
        for (let i: any = 0; i < this.pinnedShapes.length; ++i) {
            const key: any = this.pinnedShapes[i];
            if (key !== currentKey) {
                this.internalPinShape({ key });
            }
        }
    }
    /**
     * Pins a new shape
     */
    internalPinShape({ key, canUnpin = true, className = null, throughputOnly = false }: {
        key: string;
        canUnpin: boolean=;
        className: string=;
        throughputOnly: boolean=;
    }): any {
        const definition: any = this.root.shapeDefinitionMgr.getShapeFromShortKey(key);
        const element: any = makeDiv(this.element, null, ["shape"]);
        const canvas: any = definition.generateAsCanvas(120);
        element.appendChild(canvas);
        if (className) {
            element.classList.add(className);
        }
        let detector: any = null;
        if (canUnpin) {
            const unpinButton: any = document.createElement("button");
            unpinButton.classList.add("unpinButton");
            element.appendChild(unpinButton);
            element.classList.add("removable");
            detector = new ClickDetector(unpinButton, {
                consumeEvents: true,
                preventDefault: true,
                targetOnly: true,
            });
            detector.click.add((): any => this.unpinShape(key));
        }
        else {
            element.classList.add("marked");
        }
        // Show small info icon
        let infoDetector: any;
        const infoButton: any = document.createElement("button");
        infoButton.classList.add("infoButton");
        element.appendChild(infoButton);
        infoDetector = new ClickDetector(infoButton, {
            consumeEvents: true,
            preventDefault: true,
            targetOnly: true,
        });
        infoDetector.click.add((): any => this.root.hud.signals.viewShapeDetailsRequested.dispatch(definition));
        const amountLabel: any = makeDiv(element, null, ["amountLabel"], "");
        const goal: any = this.findGoalValueForShape(key);
        if (goal) {
            makeDiv(element, null, ["goalLabel"], "/" + formatBigNumber(goal));
        }
        this.handles.push({
            key,
            definition,
            element,
            amountLabel,
            lastRenderedValue: "",
            detector,
            infoDetector,
            throughputOnly,
        });
    }
    /**
     * Updates all amount labels
     */
    update(): any {
        for (let i: any = 0; i < this.handles.length; ++i) {
            const handle: any = this.handles[i];
            let currentValue: any = this.root.hubGoals.getShapesStoredByKey(handle.key);
            let currentValueFormatted: any = formatBigNumber(currentValue);
            if (handle.throughputOnly) {
                currentValue =
                    this.root.productionAnalytics.getCurrentShapeRateRaw(enumAnalyticsDataSource.delivered, handle.definition) / globalConfig.analyticsSliceDurationSeconds;
                currentValueFormatted = T.ingame.statistics.shapesDisplayUnits.second.replace("<shapes>", String(currentValue));
            }
            if (currentValueFormatted !== handle.lastRenderedValue) {
                handle.lastRenderedValue = currentValueFormatted;
                handle.amountLabel.innerText = currentValueFormatted;
                const goal: any = this.findGoalValueForShape(handle.key);
                handle.element.classList.toggle("completed", goal && currentValue > goal);
            }
        }
    }
    /**
     * Unpins a shape
     */
    unpinShape(key: string): any {
        console.log("unpin", key);
        arrayDeleteValue(this.pinnedShapes, key);
        this.rerenderFull();
    }
    /**
     * Requests to pin a new shape
     */
    pinNewShape(definition: ShapeDefinition): any {
        const key: any = definition.getHash();
        if (key === this.root.hubGoals.currentGoal.definition.getHash()) {
            // Can not pin current goal
            return;
        }
        if (key === this.root.gameMode.getBlueprintShapeKey()) {
            // Can not pin the blueprint shape
            return;
        }
        // Check if its already pinned
        if (this.pinnedShapes.indexOf(key) >= 0) {
            return;
        }
        this.pinnedShapes.push(key);
        this.rerenderFull();
    }
}
