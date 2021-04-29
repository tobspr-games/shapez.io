import { makeDiv } from "../../../core/utils";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDModeSettings extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_ModeSettings");

        const bind = (selector, handler) => this.trackClicks(this.element.querySelector(selector), handler);

        // @fixme
        if (this.root.gameMode.getBuildableZones()) {
            this.zone = makeDiv(
                this.element,
                null,
                ["section", "zone"],
                `
                <label>Zone</label>

                <div class="buttons">
                    <div class="zoneWidth plusMinus">
                        <label>Width</label>
                        <button class="styledButton minus">-</button>
                        <span class="value"></span>
                        <button class="styledButton plus">+</button>
                    </div>

                     <div class="zoneHeight plusMinus">
                        <label>Height</label>
                        <button class="styledButton minus">-</button>
                        <span class="value"></span>
                        <button class="styledButton plus">+</button>
                    </div>
                </div>`
            );

            bind(".zoneWidth .minus", () => this.modifyZone(-1, 0));
            bind(".zoneWidth .plus", () => this.modifyZone(1, 0));
            bind(".zoneHeight .minus", () => this.modifyZone(0, -1));
            bind(".zoneHeight .plus", () => this.modifyZone(0, 1));
        }
    }

    initialize() {
        this.visible = false;
        this.domAttach = new DynamicDomAttach(this.root, this.element);
        this.updateZoneValues();
    }

    modifyZone(width, height) {
        this.root.gameMode.expandZone(width, height);
        this.updateZoneValues();
    }

    updateZoneValues() {
        const zones = this.root.gameMode.getBuildableZones();
        if (!zones || zones.length === 0) {
            return;
        }

        const zone = zones[0];
        this.element.querySelector(".zoneWidth > .value").textContent = String(zone.w);
        this.element.querySelector(".zoneHeight > .value").textContent = String(zone.h);
    }

    toggle() {
        this.visible = !this.visible;
    }

    update() {
        this.domAttach.update(this.visible);
    }
}
