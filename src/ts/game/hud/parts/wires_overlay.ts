import { makeOffscreenBuffer } from "../../../core/buffer_utils";
import { globalConfig } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { Loader } from "../../../core/loader";
import { lerp } from "../../../core/utils";
import { SOUNDS } from "../../../platform/sound";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { enumHubGoalRewards } from "../../tutorial_goals";
import { BaseHUDPart } from "../base_hud_part";
const copy: any = require("clipboard-copy");
const wiresBackgroundDpi: any = 4;
export class HUDWiresOverlay extends BaseHUDPart {
    createElements(parent: any): any { }
    initialize(): any {
        // Probably not the best location, but the one which makes most sense
        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.switchLayers).add(this.switchLayers, this);
        this.root.keyMapper.getBinding(KEYMAPPINGS.placement.copyWireValue).add(this.copyWireValue, this);
        this.generateTilePattern();
        this.currentAlpha = 0.0;
    }
    /**
     * Switches between layers
     */
    switchLayers(): any {
        if (!this.root.gameMode.getSupportsWires()) {
            return;
        }
        if (this.root.currentLayer === "regular") {
            if (this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers) ||
                (G_IS_DEV && globalConfig.debug.allBuildingsUnlocked)) {
                this.root.currentLayer = "wires";
            }
        }
        else {
            this.root.currentLayer = "regular";
        }
        this.root.signals.editModeChanged.dispatch(this.root.currentLayer);
    }
    /**
     * Generates the background pattern for the wires overlay
     */
    generateTilePattern(): any {
        const overlayTile: any = Loader.getSprite("sprites/wires/overlay_tile.png");
        const dims: any = globalConfig.tileSize * wiresBackgroundDpi;
        const [canvas, context]: any = makeOffscreenBuffer(dims, dims, {
            smooth: false,
            reusable: false,
            label: "wires-tile-pattern",
        });
        context.clearRect(0, 0, dims, dims);
        overlayTile.draw(context, 0, 0, dims, dims);
        this.tilePatternCanvas = canvas;
    }
    update(): any {
        const desiredAlpha: any = this.root.currentLayer === "wires" ? 1.0 : 0.0;
        // On low performance, skip the fade
        if (this.root.entityMgr.entities.length > 5000 || this.root.dynamicTickrate.averageFps < 50) {
            this.currentAlpha = desiredAlpha;
        }
        else {
            this.currentAlpha = lerp(this.currentAlpha, desiredAlpha, 0.12);
        }
    }
    /**
     * Copies the wires value below the cursor
     */
    copyWireValue(): any {
        if (this.root.currentLayer !== "wires") {
            return;
        }
        const mousePos: any = this.root.app.mousePosition;
        if (!mousePos) {
            return;
        }
        const tile: any = this.root.camera.screenToWorld(mousePos).toTileSpace();
        const contents: any = this.root.map.getLayerContentXY(tile.x, tile.y, "wires");
        if (!contents) {
            return;
        }
        let value: any = null;
        if (contents.components.Wire) {
            const network: any = contents.components.Wire.linkedNetwork;
            if (network && network.hasValue()) {
                value = network.currentValue;
            }
        }
        if (contents.components.ConstantSignal) {
            value = contents.components.ConstantSignal.signal;
        }
        if (value) {
            copy(value.getAsCopyableKey());
            this.root.soundProxy.playUi(SOUNDS.copy);
        }
        else {
            copy("");
            this.root.soundProxy.playUiError();
        }
    }
        draw(parameters: DrawParameters): any {
        if (this.currentAlpha < 0.02) {
            return;
        }
        const hasTileGrid: any = !this.root.app.settings.getAllSettings().disableTileGrid;
        if (hasTileGrid && !this.cachedPatternBackground) {
            this.cachedPatternBackground = parameters.context.createPattern(this.tilePatternCanvas, "repeat");
        }
        const bounds: any = parameters.visibleRect;
        parameters.context.globalAlpha = this.currentAlpha;
        const scaleFactor: any = 1 / wiresBackgroundDpi;
        parameters.context.globalCompositeOperation = "overlay";
        parameters.context.fillStyle = "rgba(50, 200, 150, 1)";
        parameters.context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
        parameters.context.globalCompositeOperation = "source-over";
        parameters.context.scale(scaleFactor, scaleFactor);
        parameters.context.fillStyle = hasTileGrid
            ? this.cachedPatternBackground
            : "rgba(78, 137, 125, 0.75)";
        parameters.context.fillRect(bounds.x / scaleFactor, bounds.y / scaleFactor, bounds.w / scaleFactor, bounds.h / scaleFactor);
        parameters.context.scale(1 / scaleFactor, 1 / scaleFactor);
        parameters.context.globalAlpha = 1;
    }
}
