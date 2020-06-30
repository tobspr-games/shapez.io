import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, round3Digits, round2Digits } from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { Vector } from "../../../core/vector";

export class HUDDebugInfo extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_DebugInfo", []);

        this.tickRateElement = makeDiv(this.element, null, ["tickRate"], "Ticks /s: 120");
        this.fpsElement = makeDiv(this.element, null, ["fps"], "FPS: 60");
        this.tickDurationElement = makeDiv(this.element, null, ["tickDuration"], "Tick dur: 0.5ms");
        this.mousePositionElement = makeDiv(this.element, null, ["mousePosition"], "Pos: 0 0");
        this.cameraPositionElement = makeDiv(this.element, null, ["cameraPosition"], "Center: 0 0");
        this.versionElement = makeDiv(this.element, null, ["version"], "version unknown");
    }

    initialize() {
        this.lastTick = 0;

        this.visible = false;
        this.full = false;
        this.domAttach = new DynamicDomAttach(this.root, this.element);

        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.toggleFPSInfo).add(() => this.toggle());
    }

    updateFullText() {
        this.element.classList.toggle("debugFull", this.full);

        let version = `version ${G_BUILD_VERSION}`;
        if (this.full) {
            version += ` @ ${G_APP_ENVIRONMENT} @ ${G_BUILD_COMMIT_HASH}`;
        }

        this.versionElement.innerText = version;
    }

    updatePositions() {
        let mousePos = this.root.app.mousePosition || new Vector(0, 0);
        mousePos = this.root.camera.screenToWorld(mousePos).toTileSpace();
        const cameraPos = this.root.camera.center.toTileSpace();

        this.mousePositionElement.innerText = `Pos: ${mousePos.x} ${mousePos.y}`;
        this.cameraPositionElement.innerText = `Center: ${cameraPos.x} ${cameraPos.y}`;
    }

    toggle() {
        if (this.visible) {
            if (this.full) {
                this.visible = false;
                this.full = false;
            } else {
                this.full = true;
            }
        } else {
            this.visible = true;
        }
        this.updateFullText();
        this.domAttach.update(this.visible);
    }

    update() {
        const now = this.root.time.realtimeNow();
        if (now - this.lastTick > 0.25 && this.visible) {
            this.lastTick = now;
            this.tickRateElement.innerText = "Tickrate: " + this.root.dynamicTickrate.currentTickRate;
            this.fpsElement.innerText =
                "FPS: " +
                Math.round(this.root.dynamicTickrate.averageFps) +
                " (" +
                round2Digits(1000 / this.root.dynamicTickrate.averageFps) +
                " ms)";
            this.tickDurationElement.innerText =
                "Tick Dur: " + round3Digits(this.root.dynamicTickrate.averageTickDuration) + "ms";
        }

        this.updatePositions();
    }
}
