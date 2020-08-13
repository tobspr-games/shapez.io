import { STOP_PROPAGATION } from "../../../core/signal";
import { Vector } from "../../../core/vector";
import { enumMouseButton } from "../../camera";
import { enumLayer } from "../../root";
import { BaseHUDPart } from "../base_hud_part";

export class HUDLeverToggle extends BaseHUDPart {
    initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    /**
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    downPreHandler(pos, button) {
        if (button === enumMouseButton.left) {
            const tile = this.root.camera.screenToWorld(pos).toTileSpace();
            const contents = this.root.map.getLayerContentXY(tile.x, tile.y, enumLayer.regular);

            if (contents) {
                const leverComp = contents.components.Lever;
                if (leverComp) {
                    leverComp.toggled = !leverComp.toggled;
                    return STOP_PROPAGATION;
                }
            }
        }
    }
}
