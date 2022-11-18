import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
export class HUDVignetteOverlay extends BaseHUDPart {
    createElements(parent: any): any {
        this.element = makeDiv(parent, "ingame_VignetteOverlay");
    }
    initialize(): any { }
}
