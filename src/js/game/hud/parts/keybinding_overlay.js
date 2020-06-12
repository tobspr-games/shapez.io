import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { getStringForKeyCode, KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { TrackedState } from "../../../core/tracked_state";
import { MetaBuilding } from "../../meta_building";

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
            return getStringForKeyCode(mapper.getBinding(id).keyCodes[0]);
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
            <div class="binding placementOnly noDirectionLock">
                <code class="keybinding builtinKey shift">${getKeycode(
                    KEYMAPPINGS.placementModifiers.placeMultiple
                )}</code>
                <label>${T.ingame.keybindingsOverlay.placeMultiple}</label>
            </div>`) +
                `

            <div class="binding placementOnly directionLock">
                <code class="keybinding builtinKey shift">${getKeycode(
                    KEYMAPPINGS.placementModifiers.lockBeltDirection
                )}</code>
                <label>${T.ingame.keybindingsOverlay.lockBeltDirection}</label>
            </div>

            <div class="binding placementOnly directionLock">
                <code class="keybinding">${getKeycode(KEYMAPPINGS.placement.switchDirectionLockSide)}</code>
                <label>${T.ingame.keybindingsOverlay.plannerSwitchSide}</label>
            </div>
        `
        );
    }

    /**
     *
     * @param {MetaBuilding} selectedMetaBuilding
     */
    onSelectedBuildingForPlacementChanged(selectedMetaBuilding) {
        this.element.classList.toggle("placementActive", !!selectedMetaBuilding);
        this.element.classList.toggle(
            "hasDirectionLock",
            selectedMetaBuilding && selectedMetaBuilding.getHasDirectionLockAvailable()
        );
    }

    applyCssClasses() {
        this.element.classList.toggle("mapOverviewActive", this.root.camera.getIsMapOverlayActive());
    }

    update() {
        this.trackedMapOverviewActive.set(this.root.camera.getIsMapOverlayActive());
    }
}
