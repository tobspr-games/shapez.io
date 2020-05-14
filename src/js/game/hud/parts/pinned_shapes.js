import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, removeAllChildren, formatBigNumber } from "../../../core/utils";
import { ClickDetector } from "../../../core/click_detector";
import { ShapeDefinition } from "../../shape_definition";

export class HUDPinnedShapes extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PinnedShapes", []);
    }

    initialize() {
        this.pinnedShapes = [];

        /** @type {Array<{key: string, amountLabel: HTMLElement, lastRenderedValue: number, element: HTMLElement, detector?: ClickDetector}>} */
        this.handles = [];
        this.rerenderFull();

        this.root.signals.storyGoalCompleted.add(this.rerenderFull, this);
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
        return (
            this.pinnedShapes.indexOf(key) >= 0 || key === this.root.hubGoals.currentGoal.definition.getHash()
        );
    }

    rerenderFull() {
        const currentGoal = this.root.hubGoals.currentGoal.definition.getHash();

        // First, remove old ones
        for (let i = 0; i < this.handles.length; ++i) {
            this.handles[i].element.remove();
            const detector = this.handles[i].detector;
            if (detector) {
                detector.cleanup();
            }
        }
        this.handles = [];

        this.internalPinShape(currentGoal, false);

        for (let i = 0; i < this.pinnedShapes.length; ++i) {
            const key = this.pinnedShapes[i];
            if (key !== currentGoal) {
                this.internalPinShape(key);
            }
        }
    }

    /**
     * Pins a shape
     * @param {string} key
     * @param {boolean} canUnpin
     */
    internalPinShape(key, canUnpin = true) {
        const definition = this.root.shapeDefinitionMgr.getShapeFromShortKey(key);

        const element = makeDiv(this.element, null, ["shape"]);
        const canvas = definition.generateAsCanvas(120);
        element.appendChild(canvas);

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

        const amountLabel = makeDiv(element, null, ["amountLabel"], "123");

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

    unpinShape(key) {
        const index = this.pinnedShapes.indexOf(key);
        if (index >= 0) {
            const key = this.pinnedShapes[index];
            this.pinnedShapes.splice(index, 1);
            this.rerenderFull();
        }
    }

    /**
     * @param {ShapeDefinition} definition
     */
    pinNewShape(definition) {
        const key = definition.getHash();
        if (key === this.root.hubGoals.currentGoal.definition.getHash()) {
            // Can not pin current goal
            return;
        }
        if (this.pinnedShapes.indexOf(key) < 0) {
            // Pin
            this.pinnedShapes.push(key);
            this.rerenderFull();
        }
    }
}
