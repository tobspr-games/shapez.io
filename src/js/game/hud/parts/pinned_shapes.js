import { Math_max } from "../../../core/builtins";
import { ClickDetector } from "../../../core/click_detector";
import { formatBigNumber, makeDiv } from "../../../core/utils";
import { ShapeDefinition } from "../../shape_definition";
import { BaseHUDPart } from "../base_hud_part";
import { blueprintShape } from "../../upgrades";
import { enumHubGoalRewards } from "../../tutorial_goals";

export class HUDPinnedShapes extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PinnedShapes", []);
    }

    serialize() {
        return {
            shapes: this.pinnedShapes,
        };
    }

    deserialize(data) {
        if (!data || !data.shapes || !Array.isArray(data.shapes)) {
            return "Invalid pinned shapes data";
        }
        this.pinnedShapes = data.shapes;
    }

    initialize() {
        /** @type {Array<{ key: string, goal: number }>} */
        this.pinnedShapes = [];

        /** @type {Array<{key: string, amountLabel: HTMLElement, lastRenderedValue: number, element: HTMLElement, detector?: ClickDetector}>} */
        this.handles = [];
        this.rerenderFull();

        this.root.signals.storyGoalCompleted.add(this.rerenderFull, this);
        this.root.signals.postLoadHook.add(this.rerenderFull, this);
        this.root.hud.signals.shapePinRequested.add(this.pinNewShape, this);
    }

    /**
     * Returns whether a given shape is pinned
     * @param {string} key
     */
    isShapePinned(key) {
        if (!this.pinnedShapes) {
            return false;
        }
        if (key === this.root.hubGoals.currentGoal.definition.getHash()) {
            return true;
        }
        if (key === blueprintShape) {
            return true;
        }

        for (let i = 0; i < this.pinnedShapes.length; ++i) {
            if (this.pinnedShapes[i].key === key) {
                return true;
            }
        }
        return false;
    }

    rerenderFull() {
        const currentGoal = this.root.hubGoals.currentGoal;
        const currentKey = currentGoal.definition.getHash();

        // First, remove old ones
        for (let i = 0; i < this.handles.length; ++i) {
            this.handles[i].element.remove();
            const detector = this.handles[i].detector;
            if (detector) {
                detector.cleanup();
            }
        }
        this.handles = [];

        this.internalPinShape(currentKey, currentGoal.required, false, "goal");

        if (this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_blueprints)) {
            this.internalPinShape(blueprintShape, null, false, "blueprint");
        }

        for (let i = 0; i < this.pinnedShapes.length; ++i) {
            const key = this.pinnedShapes[i].key;
            if (key !== currentKey) {
                this.internalPinShape(key, this.pinnedShapes[i].goal);
            }
        }
    }

    /**
     * Pins a shape
     * @param {string} key
     * @param {number} goal
     * @param {boolean} canUnpin
     * @param {string=} className
     */
    internalPinShape(key, goal, canUnpin = true, className = null) {
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

        if (goal) {
            makeDiv(element, null, ["goalLabel"], "/" + formatBigNumber(goal));
        }

        this.handles.push({
            key,
            element,
            amountLabel,
            lastRenderedValue: -1,
        });
    }

    update() {
        for (let i = 0; i < this.handles.length; ++i) {
            const handle = this.handles[i];

            const currentValue = this.root.hubGoals.getShapesStoredByKey(handle.key);
            if (currentValue !== handle.lastRenderedValue) {
                handle.lastRenderedValue = currentValue;
                handle.amountLabel.innerText = formatBigNumber(currentValue);
            }
        }
    }

    /**
     * Unpins a shape
     * @param {string} key
     */
    unpinShape(key) {
        for (let i = 0; i < this.pinnedShapes.length; ++i) {
            if (this.pinnedShapes[i].key === key) {
                this.pinnedShapes.splice(i, 1);
                this.rerenderFull();
                return;
            }
        }
    }

    /**
     * @param {ShapeDefinition} definition
     * @param {number} goal
     */
    pinNewShape(definition, goal) {
        const key = definition.getHash();
        if (key === this.root.hubGoals.currentGoal.definition.getHash()) {
            // Can not pin current goal
            return;
        }

        if (key === blueprintShape) {
            return;
        }

        for (let i = 0; i < this.pinnedShapes.length; ++i) {
            if (this.pinnedShapes[i].key === key) {
                // Already pinned
                this.pinnedShapes[i].goal = Math_max(this.pinnedShapes[i].goal, goal);
                return;
            }
        }

        this.pinnedShapes.push({ key, goal });
        this.rerenderFull();
    }
}
