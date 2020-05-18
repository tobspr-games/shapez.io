import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, round3Digits } from "../../../core/utils";

export class HUDDebugInfo extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_DebugInfo", []);

        this.tickRateElement = makeDiv(this.element, null, ["tickRate"], "Ticks /s: 120");
        this.tickDurationElement = makeDiv(this.element, null, ["tickDuration"], "Update time: 0.5ms");
    }

    initialize() {}

    update() {
        this.tickRateElement.innerText = "Tickrate: " + this.root.dynamicTickrate.currentTickRate;
        this.tickDurationElement.innerText =
            "Avg. Dur: " + round3Digits(this.root.dynamicTickrate.averageTickDuration) + "ms";
    }
}
