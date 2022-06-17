import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";

export class HUDDemoTimer extends BaseHUDPart {
    createElements(parent) {
        this.mainElement = makeDiv(parent, "ingame_HUD_DemoTimer", [], "");

        this.timerElement = makeDiv(this.mainElement, null, ["timer"], "12:00");
        this.descElement = makeDiv(this.mainElement, null, ["description"], "Until end of demo");

        this.currentValue = "";
    }

    get totalTime() {
        return this.root.app.gameAnalytics.abtVariant === "1" ? 15 : 30;
    }

    initialize() {}

    update() {
        const time = Math.max(0, this.totalTime * 60 - this.root.time.now());

        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        let displayString = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");

        if (displayString !== this.currentValue) {
            this.currentValue = displayString;
            this.timerElement.innerText = displayString;
            if (time === 0) {
                this.mainElement.classList.add("expired");
            }
        }

        if (time === 0) {
            const advantages = this.root.hud.parts.standaloneAdvantages;
            if (advantages && !advantages.visible) {
                advantages.show(true);
            }
        }
    }
}
