import { openStandaloneLink } from "../../../core/config";
import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

const showCapsuleAfter = 30 * 60;

export class HUDSteamCapsule extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_SteamCapsule");
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.element);

        this.trackClicks(this.element, () => {
            openStandaloneLink(this.root.app, "shapez_steamcapsule");
        });
    }

    update() {
        this.domAttach.update(this.root.time.now() > showCapsuleAfter);
    }
}
