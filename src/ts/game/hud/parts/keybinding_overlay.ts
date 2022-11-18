import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { getStringForKeyCode, KEYCODE_LMB, KEYCODE_MMB, KEYCODE_RMB, KEYMAPPINGS, } from "../../key_action_mapper";
import { enumHubGoalRewards } from "../../tutorial_goals";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
const DIVIDER_TOKEN: any = "/";
const ADDER_TOKEN: any = "+";
export type KeyCode = {
    keyCode: number;
};
export type KeyBinding = {
    condition: () => boolean;
    keys: Array<KeyCode | number | string>;
    label: string;
    cachedElement?: HTMLElement;
    cachedVisibility?: boolean;
};


export class HUDKeybindingOverlay extends BaseHUDPart {
    /**
     * HELPER / Returns if there is a building selected for placement
     * {}
     */
    get buildingPlacementActive() {
        const placer: any = this.root.hud.parts.buildingPlacer;
        return !this.mapOverviewActive && placer && !!placer.currentMetaBuilding.get();
    }
    /**
     * HELPER / Returns if there is a building selected for placement and
     * it supports the belt planner
     * {}
     */
    get buildingPlacementSupportsBeltPlanner() {
        const placer: any = this.root.hud.parts.buildingPlacer;
        return (!this.mapOverviewActive &&
            placer &&
            placer.currentMetaBuilding.get() &&
            placer.currentMetaBuilding.get().getHasDirectionLockAvailable(placer.currentVariant.get()));
    }
    /**
     * HELPER / Returns if there is a building selected for placement and
     * it has multiplace enabled by default
     * {}
     */
    get buildingPlacementStaysInPlacement() {
        const placer: any = this.root.hud.parts.buildingPlacer;
        return (!this.mapOverviewActive &&
            placer &&
            placer.currentMetaBuilding.get() &&
            placer.currentMetaBuilding.get().getStayInPlacementMode());
    }
    /**
     * HELPER / Returns if there is a blueprint selected for placement
     * {}
     */
    get blueprintPlacementActive() {
        const placer: any = this.root.hud.parts.blueprintPlacer;
        return placer && !!placer.currentBlueprint.get();
    }
    /**
     * HELPER / Returns if the belt planner is currently active
     * {}
     */
    get beltPlannerActive() {
        const placer: any = this.root.hud.parts.buildingPlacer;
        return !this.mapOverviewActive && placer && placer.isDirectionLockActive;
    }
    /**
     * HELPER / Returns if there is a last blueprint available
     * {}
     */
    get lastBlueprintAvailable() {
        const placer: any = this.root.hud.parts.blueprintPlacer;
        return placer && !!placer.lastBlueprintUsed;
    }
    /**
     * HELPER / Returns if there is anything selected on the map
     * {}
     */
    get anythingSelectedOnMap() {
        const selector: any = this.root.hud.parts.massSelector;
        return selector && selector.selectedUids.size > 0;
    }
    /**
     * HELPER / Returns if there is a building or blueprint selected for placement
     * {}
     */
    get anyPlacementActive() {
        return this.buildingPlacementActive || this.blueprintPlacementActive;
    }
    /**
     * HELPER / Returns if the map overview is active
     * {}
     */
    get mapOverviewActive() {
        return this.root.camera.getIsMapOverlayActive();
    }
    /**
     * Initializes the element
     */
    createElements(parent: HTMLElement): any {
        const mapper: any = this.root.keyMapper;
        const k: any = KEYMAPPINGS;
                this.keybindings = [
            {
                // Move map - Including mouse
                label: T.ingame.keybindingsOverlay.moveMap,
                keys: [
                    KEYCODE_LMB,
                    DIVIDER_TOKEN,
                    k.navigation.mapMoveUp,
                    k.navigation.mapMoveLeft,
                    k.navigation.mapMoveDown,
                    k.navigation.mapMoveRight,
                ],
                condition: (): any => !this.anyPlacementActive,
            },
            {
                // Move map - No mouse
                label: T.ingame.keybindingsOverlay.moveMap,
                keys: [
                    k.navigation.mapMoveUp,
                    k.navigation.mapMoveLeft,
                    k.navigation.mapMoveDown,
                    k.navigation.mapMoveRight,
                ],
                condition: (): any => this.anyPlacementActive,
            },
            {
                // [OVERVIEW] Create marker with right click
                label: T.ingame.keybindingsOverlay.createMarker,
                keys: [KEYCODE_RMB],
                condition: (): any => this.mapOverviewActive && !this.blueprintPlacementActive,
            },
            {
                // Cancel placement
                label: T.ingame.keybindingsOverlay.stopPlacement,
                keys: [KEYCODE_RMB],
                condition: (): any => this.anyPlacementActive,
            },
            {
                // Delete with right click
                label: T.ingame.keybindingsOverlay.delete,
                keys: [KEYCODE_RMB],
                condition: (): any => !this.anyPlacementActive && !this.mapOverviewActive && !this.anythingSelectedOnMap,
            },
            {
                // Pipette
                label: T.ingame.keybindingsOverlay.pipette,
                keys: [k.placement.pipette],
                condition: (): any => !this.mapOverviewActive && !this.blueprintPlacementActive,
            },
            {
                // Area select
                label: T.ingame.keybindingsOverlay.selectBuildings,
                keys: [k.massSelect.massSelectStart, ADDER_TOKEN, KEYCODE_LMB],
                condition: (): any => !this.anyPlacementActive && !this.anythingSelectedOnMap,
            },
            {
                // Place building
                label: T.ingame.keybindingsOverlay.placeBuilding,
                keys: [KEYCODE_LMB],
                condition: (): any => this.anyPlacementActive,
            },
            {
                // Rotate
                label: T.ingame.keybindingsOverlay.rotateBuilding,
                keys: [k.placement.rotateWhilePlacing],
                condition: (): any => this.anyPlacementActive && !this.beltPlannerActive,
            },
            {
                // [BELT PLANNER] Flip Side
                label: T.ingame.keybindingsOverlay.plannerSwitchSide,
                keys: [k.placement.switchDirectionLockSide],
                condition: (): any => this.beltPlannerActive,
            },
            {
                // Place last blueprint
                label: T.ingame.keybindingsOverlay.pasteLastBlueprint,
                keys: [k.massSelect.pasteLastBlueprint],
                condition: (): any => !this.blueprintPlacementActive && this.lastBlueprintAvailable,
            },
            {
                // Belt planner
                label: T.ingame.keybindingsOverlay.lockBeltDirection,
                keys: [k.placementModifiers.lockBeltDirection],
                condition: (): any => this.buildingPlacementSupportsBeltPlanner && !this.beltPlannerActive,
            },
            {
                // [SELECTION] Destroy
                label: T.ingame.keybindingsOverlay.delete,
                keys: [k.massSelect.confirmMassDelete],
                condition: (): any => this.anythingSelectedOnMap,
            },
            {
                // [SELECTION] Cancel
                label: T.ingame.keybindingsOverlay.clearSelection,
                keys: [k.general.back],
                condition: (): any => this.anythingSelectedOnMap,
            },
            {
                // [SELECTION] Cut
                label: T.ingame.keybindingsOverlay.cutSelection,
                keys: [k.massSelect.massSelectCut],
                condition: (): any => this.anythingSelectedOnMap,
            },
            {
                // [SELECTION] Copy
                label: T.ingame.keybindingsOverlay.copySelection,
                keys: [k.massSelect.massSelectCopy],
                condition: (): any => this.anythingSelectedOnMap,
            },
            {
                // [SELECTION] Clear
                label: T.ingame.keybindingsOverlay.clearBelts,
                keys: [k.massSelect.massSelectClear],
                condition: (): any => this.anythingSelectedOnMap,
            },
            {
                // Switch layers
                label: T.ingame.keybindingsOverlay.switchLayers,
                keys: [k.ingame.switchLayers],
                condition: (): any => this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers),
            },
        ];
        if (!this.root.app.settings.getAllSettings().alwaysMultiplace) {
            this.keybindings.push({
                // Multiplace
                label: T.ingame.keybindingsOverlay.placeMultiple,
                keys: [k.placementModifiers.placeMultiple],
                condition: (): any => this.anyPlacementActive && !this.buildingPlacementStaysInPlacement,
            });
        }
        this.element = makeDiv(parent, "ingame_HUD_KeybindingOverlay", []);
        for (let i: any = 0; i < this.keybindings.length; ++i) {
            let html: any = "";
            const handle: any = this.keybindings[i];
            for (let k: any = 0; k < handle.keys.length; ++k) {
                const key: any = handle.keys[k];
                switch (key) {
                    case KEYCODE_LMB:
                        html += `<code class="keybinding leftMouse"></code>`;
                        break;
                    case KEYCODE_RMB:
                        html += `<code class="keybinding rightMouse"></code>`;
                        break;
                    case KEYCODE_MMB:
                        html += `<code class="keybinding middleMouse"></code>`;
                        break;
                    case DIVIDER_TOKEN:
                        html += `<i></i>`;
                        break;
                    case ADDER_TOKEN:
                        html += `+`;
                        break;
                    default:
                        html += `<code class="keybinding">${getStringForKeyCode(mapper.getBinding(key as KeyCode)).keyCode)}</code>`;
                }
            }
            html += `<label>${handle.label}</label>`;
            handle.cachedElement = makeDiv(this.element, null, ["binding"], html);
            handle.cachedVisibility = false;
        }
    }
    initialize(): any {
        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            trackHover: true,
        });
    }
    update(): any {
        for (let i: any = 0; i < this.keybindings.length; ++i) {
            const handle: any = this.keybindings[i];
            const visibility: any = handle.condition();
            if (visibility !== handle.cachedVisibility) {
                handle.cachedVisibility = visibility;
                handle.cachedElement.classList.toggle("visible", visibility);
            }
        }
        // Required for hover
        this.domAttach.update(true);
    }
}
