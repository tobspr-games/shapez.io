import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

const memeShowIntervalSeconds = 70 * 60;
const memeShowDuration = 5;

export class HUDCatMemes extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_CatMemes");
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }

    update() {
        const now = this.root.time.realtimeNow();
        this.domAttach.update(now % memeShowIntervalSeconds > memeShowIntervalSeconds - memeShowDuration);
    }
}
