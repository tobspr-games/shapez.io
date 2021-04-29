/* typehints:start */
import { globalConfig, IS_MOBILE } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
/* dev:end */
import { Signal } from "../../core/signal";
import { KEYMAPPINGS } from "../key_action_mapper";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { ShapeDefinition } from "../shape_definition";
import { HUDBetaOverlay } from "./parts/beta_overlay";
import { HUDBlueprintPlacer } from "./parts/blueprint_placer";
import { HUDBuildingsToolbar } from "./parts/buildings_toolbar";
import { HUDBuildingPlacer } from "./parts/building_placer";
import { HUDCatMemes } from "./parts/cat_memes";
import { HUDColorBlindHelper } from "./parts/color_blind_helper";
import { HUDConstantSignalEdit } from "./parts/constant_signal_edit";
import { HUDChangesDebugger } from "./parts/debug_changes";
import { HUDDebugInfo } from "./parts/debug_info";
import { HUDEntityDebugger } from "./parts/entity_debugger";
import { HUDGameMenu } from "./parts/game_menu";
import { HUDInteractiveTutorial } from "./parts/interactive_tutorial";
import { HUDKeybindingOverlay } from "./parts/keybinding_overlay";
import { HUDLayerPreview } from "./parts/layer_preview";
import { HUDLeverToggle } from "./parts/lever_toggle";
import { HUDMassSelector } from "./parts/mass_selector";
import { HUDMinerHighlight } from "./parts/miner_highlight";
import { HUDModalDialogs } from "./parts/modal_dialogs";
import { HUDModeMenu } from "./parts/mode_menu";
import { HUDModeMenuBack } from "./parts/mode_menu_back";
import { HUDModeMenuNext } from "./parts/mode_menu_next";
import { HUDModeSettings } from "./parts/mode_settings";
import { enumNotificationType, HUDNotifications } from "./parts/notifications";
import { HUDPinnedShapes } from "./parts/pinned_shapes";
import { HUDPuzzleDLCLogo } from "./parts/puzzle_dlc_logo";
import { HUDSandboxController } from "./parts/sandbox_controller";
import { HUDScreenshotExporter } from "./parts/screenshot_exporter";
import { HUDSettingsMenu } from "./parts/settings_menu";
import { HUDShapeViewer } from "./parts/shape_viewer";
import { HUDShop } from "./parts/shop";
import { HUDStandaloneAdvantages } from "./parts/standalone_advantages";
import { HUDStatistics } from "./parts/statistics";
import { HUDPartTutorialHints } from "./parts/tutorial_hints";
import { HUDTutorialVideoOffer } from "./parts/tutorial_video_offer";
import { HUDUnlockNotification } from "./parts/unlock_notification";
import { HUDVignetteOverlay } from "./parts/vignette_overlay";
import { HUDWatermark } from "./parts/watermark";
import { HUDWaypoints } from "./parts/waypoints";
import { HUDWiresOverlay } from "./parts/wires_overlay";
import { HUDWiresToolbar } from "./parts/wires_toolbar";
import { HUDWireInfo } from "./parts/wire_info";
/* typehints:end */
/* dev:start */
import { TrailerMaker } from "./trailer_maker";

export class GameHUD {
    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;
    }

    /**
     * Initializes the hud parts
     */
    initialize() {
        this.signals = {
            buildingSelectedForPlacement: /** @type {TypedSignal<[MetaBuilding|null]>} */ (new Signal()),
            selectedPlacementBuildingChanged: /** @type {TypedSignal<[MetaBuilding|null]>} */ (new Signal()),
            shapePinRequested: /** @type {TypedSignal<[ShapeDefinition]>} */ (new Signal()),
            shapeUnpinRequested: /** @type {TypedSignal<[string]>} */ (new Signal()),
            notification: /** @type {TypedSignal<[string, enumNotificationType]>} */ (new Signal()),
            buildingsSelectedForCopy: /** @type {TypedSignal<[Array<number>]>} */ (new Signal()),
            pasteBlueprintRequested: /** @type {TypedSignal<[]>} */ (new Signal()),
            viewShapeDetailsRequested: /** @type {TypedSignal<[ShapeDefinition]>} */ (new Signal()),
            unlockNotificationFinished: /** @type {TypedSignal<[]>} */ (new Signal()),
        };

        this.initParts({
            buildingsToolbar: HUDBuildingsToolbar,
            wiresToolbar: HUDWiresToolbar,
            blueprintPlacer: HUDBlueprintPlacer,
            buildingPlacer: HUDBuildingPlacer,
            unlockNotification: HUDUnlockNotification,
            gameMenu: HUDGameMenu,
            massSelector: HUDMassSelector,
            shop: HUDShop,
            statistics: HUDStatistics,
            waypoints: HUDWaypoints,
            wireInfo: HUDWireInfo,
            leverToggle: HUDLeverToggle,
            constantSignalEdit: HUDConstantSignalEdit,
            modeMenuBack: HUDModeMenuBack,
            modeMenuNext: HUDModeMenuNext,
            modeMenu: HUDModeMenu,
            modeSettings: HUDModeSettings,
            puzzleDlcLogo: HUDPuzzleDLCLogo,

            // Must always exist
            pinnedShapes: HUDPinnedShapes,
            notifications: HUDNotifications,
            settingsMenu: HUDSettingsMenu,
            debugInfo: HUDDebugInfo,
            dialogs: HUDModalDialogs,
            screenshotExporter: HUDScreenshotExporter,
            shapeViewer: HUDShapeViewer,

            wiresOverlay: HUDWiresOverlay,
            layerPreview: HUDLayerPreview,

            minerHighlight: HUDMinerHighlight,
            tutorialVideoOffer: HUDTutorialVideoOffer,

            // Typing hints
            /* typehints:start */
            /** @type {HUDChangesDebugger} */
            changesDebugger: null,
            /* typehints:end */
        });

        if (!IS_MOBILE) {
            if (!this.root.gameMode.isHudPartExcluded(HUDKeybindingOverlay.name)) {
                this.parts.keybindingOverlay = new HUDKeybindingOverlay(this.root);
            }
        }

        if (G_IS_DEV && globalConfig.debug.enableEntityInspector) {
            this.parts.entityDebugger = new HUDEntityDebugger(this.root);
        }

        if (this.root.app.restrictionMgr.getIsStandaloneMarketingActive()) {
            this.parts.watermark = new HUDWatermark(this.root);
            this.parts.standaloneAdvantages = new HUDStandaloneAdvantages(this.root);
            this.parts.catMemes = new HUDCatMemes(this.root);
        }

        if (G_IS_DEV && globalConfig.debug.renderChanges) {
            this.parts.changesDebugger = new HUDChangesDebugger(this.root);
        }

        if (this.root.app.settings.getAllSettings().offerHints) {
            if (!this.root.gameMode.isHudPartExcluded(HUDPartTutorialHints.name)) {
                this.parts.tutorialHints = new HUDPartTutorialHints(this.root);
            }

            if (!this.root.gameMode.isHudPartExcluded(HUDInteractiveTutorial.name)) {
                this.parts.interactiveTutorial = new HUDInteractiveTutorial(this.root);
            }
        }

        if (this.root.app.settings.getAllSettings().vignette) {
            this.parts.vignetteOverlay = new HUDVignetteOverlay(this.root);
        }

        if (this.root.app.settings.getAllSettings().enableColorBlindHelper) {
            this.parts.colorBlindHelper = new HUDColorBlindHelper(this.root);
        }

        this.parts.sandboxController = new HUDSandboxController(this.root);

        if (!G_IS_RELEASE && !G_IS_DEV) {
            this.parts.betaOverlay = new HUDBetaOverlay(this.root);
        }

        const frag = document.createDocumentFragment();
        for (const key in this.parts) {
            this.parts[key].createElements(frag);
        }

        document.body.appendChild(frag);

        for (const key in this.parts) {
            this.parts[key].initialize();
        }

        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.toggleHud).add(this.toggleUi, this);

        /* dev:start */
        if (G_IS_DEV && globalConfig.debug.renderForTrailer) {
            this.trailerMaker = new TrailerMaker(this.root);
        }
        /* dev:end*/
    }

    /** @param {object} parts */
    initParts(parts) {
        this.parts = {};

        for (let key in parts) {
            const Part = parts[key];

            if (!Part || this.root.gameMode.isHudPartExcluded(Part.name)) {
                continue;
            }

            this.parts[key] = new Part(this.root);
        }
    }

    /**
     * Attempts to close all overlays
     */
    closeAllOverlays() {
        for (const key in this.parts) {
            this.parts[key].close();
        }
    }

    /**
     * Returns true if the game logic should be paused
     */
    shouldPauseGame() {
        for (const key in this.parts) {
            if (this.parts[key].shouldPauseGame()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if the rendering can be paused
     */
    shouldPauseRendering() {
        for (const key in this.parts) {
            if (this.parts[key].shouldPauseRendering()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if the rendering can be paused
     */
    hasBlockingOverlayOpen() {
        for (const key in this.parts) {
            if (this.parts[key].isBlockingOverlay()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Toggles the ui
     */
    toggleUi() {
        document.body.classList.toggle("uiHidden");
    }

    /**
     * Updates all parts
     */
    update() {
        if (!this.root.gameInitialized) {
            return;
        }

        for (const key in this.parts) {
            this.parts[key].update();
        }

        /* dev:start */
        if (this.trailerMaker) {
            this.trailerMaker.update();
        }
        /* dev:end*/
    }

    /**
     * Draws all parts
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        const partsOrder = [
            "massSelector",
            "buildingPlacer",
            "blueprintPlacer",
            "colorBlindHelper",
            "changesDebugger",
            "minerHighlight",
        ];

        for (let i = 0; i < partsOrder.length; ++i) {
            if (this.parts[partsOrder[i]]) {
                this.parts[partsOrder[i]].draw(parameters);
            }
        }
    }

    /**
     * Draws all part overlays
     * @param {DrawParameters} parameters
     */
    drawOverlays(parameters) {
        const partsOrder = ["waypoints", "watermark", "wireInfo"];

        for (let i = 0; i < partsOrder.length; ++i) {
            if (this.parts[partsOrder[i]]) {
                this.parts[partsOrder[i]].drawOverlays(parameters);
            }
        }
    }

    /**
     * Cleans up everything
     */
    cleanup() {
        for (const key in this.parts) {
            this.parts[key].cleanup();
        }

        for (const key in this.signals) {
            this.signals[key].removeAll();
        }
    }
}
