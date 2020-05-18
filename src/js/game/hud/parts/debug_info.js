import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, round3Digits, round2Digits } from "../../../core/utils";
import { Math_round } from "../../../core/builtins";

export class HUDDebugInfo extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_DebugInfo", []);

        this.tickRateElement = makeDiv(this.element, null, ["tickRate"], "Ticks /s: 120");
        this.fpsElement = makeDiv(this.element, null, ["fps"], "FPS: 60");
        this.tickDurationElement = makeDiv(this.element, null, ["tickDuration"], "Update time: 0.5ms");
    }

    initialize() {
        this.lastTick = 0;
    }

    update() {
        const now = this.root.time.realtimeNow();
        if (now - this.lastTick > 0.25) {
            this.lastTick = now;
            this.tickRateElement.innerText = "Tickrate: " + this.root.dynamicTickrate.currentTickRate;
            this.fpsElement.innerText =
                "FPS: " +
                Math_round(this.root.dynamicTickrate.averageFps) +
                " (" +
                round2Digits(1000 / this.root.dynamicTickrate.averageFps) +
                " ms)";
            this.tickDurationElement.innerText =
                "Tick Dur: " + round3Digits(this.root.dynamicTickrate.averageTickDuration) + "ms";
        }
    }
}
