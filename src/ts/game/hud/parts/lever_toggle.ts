import { STOP_PROPAGATION } from "../../../core/signal";
import { Vector } from "../../../core/vector";
import { enumMouseButton } from "../../camera";
import { BaseHUDPart } from "../base_hud_part";
export class HUDLeverToggle extends BaseHUDPart {
    initialize(): any {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }
        downPreHandler(pos: Vector, button: enumMouseButton): any {
        const tile: any = this.root.camera.screenToWorld(pos).toTileSpace();
        const contents: any = this.root.map.getLayerContentXY(tile.x, tile.y, "regular");
        if (contents) {
            const leverComp: any = contents.components.Lever;
            if (leverComp) {
                if (button === enumMouseButton.left) {
                    leverComp.toggled = !leverComp.toggled;
                    return STOP_PROPAGATION;
                }
                else if (button === enumMouseButton.right) {
                    if (!this.root.hud.parts.buildingPlacer.currentMetaBuilding) {
                        this.root.logic.tryDeleteBuilding(contents);
                    }
                    return STOP_PROPAGATION;
                }
            }
        }
    }
}
