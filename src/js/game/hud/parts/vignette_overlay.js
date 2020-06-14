import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { KEYMAPPINGS } from "../../key_action_mapper";

export class HUDVignetteOverlay extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_VignetteOverlay");
    }

    initialize() {
        this.visible = true;
        this.domAttach = new DynamicDomAttach(this.root, this.element);
        this.domAttach.update(this.visible);

        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.toggleVignette).add(() => this.toggle());
    }

    toggle() {
        this.visible = !this.visible;
        this.domAttach.update(this.visible);
    }
}
