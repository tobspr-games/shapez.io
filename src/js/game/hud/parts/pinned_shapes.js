import { Math_max } from "../../../core/builtins";
import { ClickDetector } from "../../../core/click_detector";
import { formatBigNumber, makeDiv, arrayDelete, arrayDeleteValue } from "../../../core/utils";
import { ShapeDefinition } from "../../shape_definition";
import { BaseHUDPart } from "../base_hud_part";
import { blueprintShape, UPGRADES } from "../../upgrades";
import { enumHubGoalRewards } from "../../tutorial_goals";

/**
 * Manages the pinned shapes on the left side of the screen
 */
export class HUDPinnedShapes extends BaseHUDPart {
    constructor(root) {
        super(root);
        /**
         * Store a list of pinned shapes
         * @type {Array<string>}
         */
        this.pinnedShapes = [];

        /**
         * Store handles to the currently rendered elements, so we can update them more
         * convenient. Also allows for cleaning up handles.
         * @type {Array<{
         *  key: string,
         *  amountLabel: HTMLElement,
         *  lastRenderedValue: string,
         *  element: HTMLElement,
         *  detector?: ClickDetector
         * }>}
         */
        this.handles = [];
    }

    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PinnedShapes", []);
    }

    /**
     * Serializes the pinned shapes
     */
    serialize() {
        return {
            shapes: this.pinnedShapes,
        };
    }

    /**
     * Deserializes the pinned shapes
     * @param {{ shapes: Array<string>}} data
     */
    deserialize(data) {
        if (!data || !data.shapes || !Array.isArray(data.shapes)) {
            return "Invalid pinned shapes data";
        }
        this.pinnedShapes = data.shapes;
    }

    /**
     * Initializes the hud component
     */
    initialize() {
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
    updateShapesAfterUpgrade() {
        for (let i = 0; i < this.pinnedShapes.length; ++i) {
            const key = this.pinnedShapes[i];
            if (key === blueprintShape) {
                // Ignore blueprint shapes
                continue;
            }
            let goal = this.findGoalValueForShape(key);
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
     * @param {string} key
     */
    findGoalValueForShape(key) {
        if (key === this.root.hubGoals.currentGoal.definition.getHash()) {
            return this.root.hubGoals.currentGoal.required;
        }
        if (key === blueprintShape) {
            return null;
        }

        // Check if this shape is required for any upgrade
        for (const upgradeId in UPGRADES) {
            const { tiers } = UPGRADES[upgradeId];
            const currentTier = this.root.hubGoals.getUpgradeLevel(upgradeId);
            const tierHandle = tiers[currentTier];

            if (!tierHandle) {
                // Max level
                continue;
            }

            for (let i = 0; i < tierHandle.required.length; ++i) {
                const { shape, amount } = tierHandle.required[i];
                if (shape === key) {
                    return amount;
                }
            }
        }

        return null;
    }

    /**
     * Returns whether a given shape is currently pinned
     * @param {string} key
     */
    isShapePinned(key) {
        if (key === this.root.hubGoals.currentGoal.definition.getHash() || key === blueprintShape) {
            // This is a "special" shape which is always pinned
            return true;
        }

        return this.pinnedShapes.indexOf(key) >= 0;
    }

    /**
     * Rerenders the whole component
     */
    rerenderFull() {
        const currentGoal = this.root.hubGoals.currentGoal;
        const currentKey = currentGoal.definition.getHash();

        // First, remove all old shapes
        for (let i = 0; i < this.handles.length; ++i) {
            this.handles[i].element.remove();
            const detector = this.handles[i].detector;
            if (detector) {
                detector.cleanup();
            }
        }
        this.handles = [];

        // Pin story goal
        this.internalPinShape(currentKey, false, "goal");

        // Pin blueprint shape as well
        if (this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_blueprints)) {
            this.internalPinShape(blueprintShape, false, "blueprint");
        }

        // Pin manually pinned shapes
        for (let i = 0; i < this.pinnedShapes.length; ++i) {
            const key = this.pinnedShapes[i];
            if (key !== currentKey) {
                this.internalPinShape(key);
            }
        }
    }

    /**
     * Pins a new shape
     * @param {string} key
     * @param {boolean} canUnpin
     * @param {string=} className
     */
    internalPinShape(key, canUnpin = true, className = null) {
        const definition = this.root.shapeDefinitionMgr.getShapeFromShortKey(key);

        const element = makeDiv(this.element, null, ["shape"]);
        const canvas = definition.generateAsCanvas(120);
        element.appendChild(canvas);

        if (className) {
            element.classList.add(className);
        }

        let detector = null;
        if (canUnpin) {
            element.classList.add("unpinable");
            detector = new ClickDetector(element, {
                consumeEvents: true,
                preventDefault: true,
            });
            detector.click.add(() => this.unpinShape(key));
        } else {
            element.classList.add("marked");
        }

        const amountLabel = makeDiv(element, null, ["amountLabel"], "");

        const goal = this.findGoalValueForShape(key);
        if (goal) {
            makeDiv(element, null, ["goalLabel"], "/" + formatBigNumber(goal));
        }

        this.handles.push({
            key,
            element,
            amountLabel,
            lastRenderedValue: "",
        });
    }

    /**
     * Updates all amount labels
     */
    update() {
        for (let i = 0; i < this.handles.length; ++i) {
            const handle = this.handles[i];

            const currentValue = this.root.hubGoals.getShapesStoredByKey(handle.key);
            const currentValueFormatted = formatBigNumber(currentValue);
            if (currentValueFormatted !== handle.lastRenderedValue) {
                handle.lastRenderedValue = currentValueFormatted;
                handle.amountLabel.innerText = currentValueFormatted;
                const goal = this.findGoalValueForShape(handle.key);
                handle.element.classList.toggle("completed", goal && currentValue > goal);
            }
        }
    }

    /**
     * Unpins a shape
     * @param {string} key
     */
    unpinShape(key) {
        arrayDeleteValue(this.pinnedShapes, key);
        this.rerenderFull();
    }

    /**
     * Requests to pin a new shape
     * @param {ShapeDefinition} definition
     */
    pinNewShape(definition) {
        const key = definition.getHash();
        if (key === this.root.hubGoals.currentGoal.definition.getHash()) {
            // Can not pin current goal
            return;
        }

        if (key === blueprintShape) {
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
