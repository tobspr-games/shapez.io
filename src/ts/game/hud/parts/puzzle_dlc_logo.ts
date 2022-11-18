import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";
export class HUDPuzzleDLCLogo extends BaseHUDPart {
    createElements(parent: any): any {
        this.element = makeDiv(parent, "ingame_HUD_PuzzleDLCLogo");
        parent.appendChild(this.element);
    }
    initialize(): any { }
    next(): any { }
}
