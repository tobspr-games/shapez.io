import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { getStringForKeyCode, KEYMAPPINGS } from "../../key_action_mapper";
import { TrackedState } from "../../../core/tracked_state";
import { queryParamOptions } from "../../../core/query_parameters";
import { T } from "../../../translations";

export class HUDKeybindingOverlay extends BaseHUDPart {
    initialize() {
        this.shiftDownTracker = new TrackedState(this.onShiftStateChanged, this);

        this.root.hud.signals.selectedPlacementBuildingChanged.add(
            this.onSelectedBuildingForPlacementChanged,
            this
        );
    }

    onShiftStateChanged(shiftDown) {
        this.element.classList.toggle("shiftDown", shiftDown);
    }

    createElements(parent) {
        const mapper = this.root.keyMapper;

        const getKeycode = id => {
            return getStringForKeyCode(mapper.getBinding(id).keyCode);
        };

        this.element = makeDiv(
            parent,
            "ingame_HUD_KeybindingOverlay",
            [],
            `
            <div class="binding">
                <code class="keybinding">${getKeycode(KEYMAPPINGS.ingame.centerMap)}</code>
                <label>${T.ingame.keybindingsOverlay.centerMap}</label>
            </div>

            <div class="binding">
                <code class="keybinding leftMouse"></code><i></i>
                <code class="keybinding">${getKeycode(KEYMAPPINGS.ingame.mapMoveUp)}</code>
                <code class="keybinding">${getKeycode(KEYMAPPINGS.ingame.mapMoveLeft)}</code>
                <code class="keybinding">${getKeycode(KEYMAPPINGS.ingame.mapMoveDown)}</code>
                <code class="keybinding">${getKeycode(KEYMAPPINGS.ingame.mapMoveRight)}</code>
                <label>${T.ingame.keybindingsOverlay.moveMap}</label>
            </div>               
            
            <div class="binding noPlacementOnly">
                <code class="keybinding rightMouse"></code><i></i>
                <code class="keybinding builtinKey">${T.global.keys.control}</code>+
                <code class="keybinding leftMouse"></code>
                <label>${T.ingame.keybindingsOverlay.removeBuildings}</label>
            </div>
            
            
            <div class="binding placementOnly">
                <code class="keybinding rightMouse"></code><i></i>
                <code class="keybinding">${getKeycode(KEYMAPPINGS.placement.abortBuildingPlacement)}</code>
                <label>${T.ingame.keybindingsOverlay.stopPlacement}</label>
            </div>

            <div class="binding placementOnly">
                <code class="keybinding">${getKeycode(KEYMAPPINGS.placement.rotateWhilePlacing)}</code>
                <label>${T.ingame.keybindingsOverlay.rotateBuilding}</label>
            </div>

            <div class="binding placementOnly">
                <code class="keybinding builtinKey shift">⇧ ${T.global.keys.shift}</code>
                <label>${T.ingame.keybindingsOverlay.placeMultiple}</label>
            </div>

            <div class="binding placementOnly">
                <code class="keybinding builtinKey">${T.global.keys.alt}</code>
                <label>${T.ingame.keybindingsOverlay.reverseOrientation}</label>
            </div>

            <div class="binding placementOnly">
                <code class="keybinding builtinKey">${T.global.keys.control}</code>
                <label>${T.ingame.keybindingsOverlay.disableAutoOrientation}</label>
            </div>
        ` +
                (queryParamOptions.betaMode
                    ? `
            <div class="binding hudToggle">
                <code class="keybinding">F2</code>
                <label>${T.ingame.keybindingsOverlay.toggleHud}</label>
            </div>
        `
                    : "")
        );
    }

    onSelectedBuildingForPlacementChanged(selectedMetaBuilding) {
        this.element.classList.toggle("placementActive", !!selectedMetaBuilding);
    }

    update() {
        this.shiftDownTracker.set(this.root.app.inputMgr.shiftIsDown);
    }
}
