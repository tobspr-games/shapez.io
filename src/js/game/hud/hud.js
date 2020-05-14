/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { Signal } from "../../core/signal";
import { DrawParameters } from "../../core/draw_parameters";
import { HUDProcessingOverlay } from "./parts/processing_overlay";
import { HUDBuildingsToolbar } from "./parts/buildings_toolbar";
import { HUDBuildingPlacer } from "./parts/building_placer";
import { HUDBetaOverlay } from "./parts/beta_overlay";
import { HUDKeybindingOverlay } from "./parts/keybinding_overlay";
import { HUDUnlockNotification } from "./parts/unlock_notification";
import { HUDGameMenu } from "./parts/game_menu";
import { HUDShop } from "./parts/shop";
import { IS_MOBILE } from "../../core/config";
import { HUDMassSelector } from "./parts/mass_selector";
import { HUDVignetteOverlay } from "./parts/vignette_overlay";
import { HUDStatistics } from "./parts/statistics";
import { MetaBuilding } from "../meta_building";
import { HUDPinnedShapes } from "./parts/pinned_shapes";
import { ShapeDefinition } from "../shape_definition";

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
        this.parts = {
            processingOverlay: new HUDProcessingOverlay(this.root),

            buildingsToolbar: new HUDBuildingsToolbar(this.root),
            buildingPlacer: new HUDBuildingPlacer(this.root),

            unlockNotification: new HUDUnlockNotification(this.root),

            gameMenu: new HUDGameMenu(this.root),

            massSelector: new HUDMassSelector(this.root),

            shop: new HUDShop(this.root),
            statistics: new HUDStatistics(this.root),

            vignetteOverlay: new HUDVignetteOverlay(this.root),

            pinnedShapes: new HUDPinnedShapes(this.root),

            // betaOverlay: new HUDBetaOverlay(this.root),
        };

        this.signals = {
            selectedPlacementBuildingChanged: /** @type {TypedSignal<[MetaBuilding|null]>} */ (new Signal()),
            shapePinRequested: /** @type {TypedSignal<[ShapeDefinition]>} */ (new Signal()),
        };

        if (!IS_MOBILE) {
            this.parts.keybindingOverlay = new HUDKeybindingOverlay(this.root);
        }

        const frag = document.createDocumentFragment();
        for (const key in this.parts) {
            this.parts[key].createElements(frag);
        }

        document.body.appendChild(frag);

        for (const key in this.parts) {
            this.parts[key].initialize();
        }
        this.internalInitSignalConnections();

        this.root.gameState.keyActionMapper.getBinding("toggle_hud").add(this.toggleUi, this);
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
        if (this.root.camera.getIsMapOverlayActive()) {
            return true;
        }
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
     * Initializes connections between parts
     */
    internalInitSignalConnections() {
        const p = this.parts;
        p.buildingsToolbar.sigBuildingSelected.add(p.buildingPlacer.startSelection, p.buildingPlacer);
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
    }

    /**
     * Draws all parts
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        const partsOrder = ["massSelector", "buildingPlacer"];

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
        const partsOrder = [];

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
