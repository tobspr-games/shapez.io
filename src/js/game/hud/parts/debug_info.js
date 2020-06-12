import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, round3Digits, round2Digits } from "../../../core/utils";
import { Math_round } from "../../../core/builtins";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { T } from "../../../translations.js";

export class HUDDebugInfo extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_DebugInfo", []);

        this.tickRateElement = makeDiv(this.element, null, ["tickRate"], "Ticks /s: 120");
        this.fpsElement = makeDiv(this.element, null, ["fps"], "FPS: 60");
        this.tickDurationElement = makeDiv(this.element, null, ["tickDuration"], "Update time: 0.5ms");
    }

    initialize() {
        this.lastTick = 0;

        this.visible = false;
        this.domAttach = new DynamicDomAttach(this.root, this.element);

        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.toggleFPSInfo).add(() => this.toggle());
    }

    toggle() {
        this.visible = !this.visible;
        this.domAttach.update(this.visible);
    }

    update() {
        const now = this.root.time.realtimeNow();
        if (now - this.lastTick > 0.25 && this.visible) {
            this.lastTick = now;
            this.tickRateElement.innerText = T.ingame.debug.tickrate.replace(
                "<x>",
                this.root.dynamicTickrate.currentTickRate.toString()
            );
            this.fpsElement.innerText = T.ingame.debug.fps
                .replace("<fps>", Math_round(this.root.dynamicTickrate.averageFps).toString())
                .replace("<ms>", round2Digits(1000 / this.root.dynamicTickrate.averageFps).toString());
            this.tickDurationElement.innerText = T.ingame.debug.tickDuration.replace(
                "<ms>",
                round3Digits(this.root.dynamicTickrate.averageTickDuration).toString()
            );
        }
    }
}
