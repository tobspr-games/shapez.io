import { STOP_PROPAGATION } from "../../../core/signal";
import { Vector } from "../../../core/vector";
import { enumMouseButton } from "../../camera";
import { BaseHUDPart } from "../base_hud_part";

export class HUDEditConstantSignal extends BaseHUDPart {
    initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    /**
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    downPreHandler(pos, button) {
        const tile = this.root.camera.screenToWorld(pos).toTileSpace();
        const contents = this.root.map.getLayerContentXY(tile.x, tile.y, "wires");
        if (contents) {
            const signalComp = contents.components.ConstantSignal;
            if (signalComp) {
                if (button === enumMouseButton.left) {
                    signalComp.clicked = true;
                    return STOP_PROPAGATION;
                } else if (button === enumMouseButton.right) {
                    this.root.logic.tryDeleteBuilding(contents);
                    return STOP_PROPAGATION;
                }
            }
        }
    }
}
