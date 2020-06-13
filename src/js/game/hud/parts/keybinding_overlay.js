import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { getStringForKeyCode, KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { TrackedState } from "../../../core/tracked_state";

export class HUDKeybindingOverlay extends BaseHUDPart {
    initialize() {
        this.root.hud.signals.selectedPlacementBuildingChanged.add(
            this.onSelectedBuildingForPlacementChanged,
            this
        );

        this.trackedMapOverviewActive = new TrackedState(this.applyCssClasses, this);
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
                <code class="keybinding leftMouse noPlacementOnly"></code><i class="noPlacementOnly"></i>
                <code class="keybinding">${getKeycode(KEYMAPPINGS.navigation.mapMoveUp)}</code>
                <code class="keybinding">${getKeycode(KEYMAPPINGS.navigation.mapMoveLeft)}</code>
                <code class="keybinding">${getKeycode(KEYMAPPINGS.navigation.mapMoveDown)}</code>
                <code class="keybinding">${getKeycode(KEYMAPPINGS.navigation.mapMoveRight)}</code>
                <label>${T.ingame.keybindingsOverlay.moveMap}</label>
                </div>



            <div class="binding noPlacementOnly noOverviewOnly">
                <code class="keybinding rightMouse"></code>
                <label>${T.ingame.keybindingsOverlay.delete}</label>
            </div>

            <div class="binding noPlacementOnly overviewOnly">
                <code class="keybinding rightMouse"></code>
                <label>${T.ingame.keybindingsOverlay.createMarker}</label>
            </div>


            <div class="binding noPlacementOnly">
                <code class="keybinding builtinKey">${getKeycode(
                    KEYMAPPINGS.massSelect.massSelectStart
                )}</code>+
                <code class="keybinding leftMouse"></code>
                <label>${T.ingame.keybindingsOverlay.selectBuildings}</label>
            </div>

            <div class="binding placementOnly">
                <code class="keybinding leftMouse"></code>
                <label>${T.ingame.keybindingsOverlay.placeBuilding}</label>
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

            ` +
                (this.root.app.settings.getAllSettings().alwaysMultiplace
                    ? ""
                    : `
            <div class="binding placementOnly">
                <code class="keybinding builtinKey shift">${getKeycode(
                    KEYMAPPINGS.placementModifiers.placeMultiple
                )}</code>
                <label>${T.ingame.keybindingsOverlay.placeMultiple}</label>
            </div>`) +
                `
        `
        );
    }

    onSelectedBuildingForPlacementChanged(selectedMetaBuilding) {
        this.element.classList.toggle("placementActive", !!selectedMetaBuilding);
    }

    applyCssClasses() {
        this.element.classList.toggle("mapOverviewActive", this.root.camera.getIsMapOverlayActive());
    }

    update() {
        this.trackedMapOverviewActive.set(this.root.camera.getIsMapOverlayActive());
    }
}
