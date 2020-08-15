import { globalConfig } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { Rectangle } from "../../../core/rectangle";
import { BaseHUDPart } from "../base_hud_part";

/**
 * @typedef {{
 *    label: string,
 *    area: Rectangle,
 *    hideAt: number,
 *    fillColor: string
 * }} DebugChange
 */

export class HUDChangesDebugger extends BaseHUDPart {
    createElements(parent) {}

    initialize() {
        /** @type {Array<DebugChange>} */
        this.changes = [];
    }

    /**
     * Renders a new change
     * @param {string} label Text to display
     * @param {Rectangle} area Affected area world space
     * @param {string} fillColor Color to display (Hex)
     * @param {number=} timeToDisplay How long to display the change
     */
    renderChange(label, area, fillColor, timeToDisplay = 0.3) {
        this.changes.push({
            label,
            area: area.clone(),
            fillColor,
            hideAt: this.root.time.realtimeNow() + timeToDisplay,
        });
    }

    update() {
        const now = this.root.time.realtimeNow();
        // Detect outdated changes
        for (let i = 0; i < this.changes.length; ++i) {
            const change = this.changes[i];
            if (change.hideAt <= now) {
                this.changes.splice(i, 1);
                i -= 1;
                continue;
            }
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        for (let i = 0; i < this.changes.length; ++i) {
            const change = this.changes[i];
            parameters.context.fillStyle = change.fillColor;
            parameters.context.globalAlpha = 0.2;
            parameters.context.fillRect(
                change.area.x * globalConfig.tileSize,
                change.area.y * globalConfig.tileSize,
                change.area.w * globalConfig.tileSize,
                change.area.h * globalConfig.tileSize
            );

            parameters.context.fillStyle = "#222";
            parameters.context.globalAlpha = 1;
            parameters.context.font = "bold 8px GameFont";
            parameters.context.fillText(
                change.label,
                change.area.x * globalConfig.tileSize + 2,
                change.area.y * globalConfig.tileSize + 12
            );
        }
    }
}
