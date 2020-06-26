import { makeOffscreenBuffer } from "../../../core/buffer_utils";
import { globalConfig } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { enumEditMode } from "../../root";
import { THEME } from "../../theme";
import { BaseHUDPart } from "../base_hud_part";

const wiresBackgroundDpi = 3;

export class HUDWiresOverlay extends BaseHUDPart {
    createElements(parent) {}

    initialize() {
        // Probably not the best location, but the one which makes most sense
        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.switchLayers).add(this.switchLayers, this);

        this.generateTilePattern();
    }

    /**
     * Switches between layers
     */
    switchLayers() {
        if (this.root.editMode === enumEditMode.regular) {
            this.root.editMode = enumEditMode.wires;
        } else {
            this.root.editMode = enumEditMode.regular;
        }
        this.root.signals.editModeChanged.dispatch(this.root.editMode);
    }

    /**
     * Generates the background pattern for the wires overlay
     */
    generateTilePattern() {
        const dims = globalConfig.tileSize * wiresBackgroundDpi;
        const [canvas, context] = makeOffscreenBuffer(dims, dims, {
            smooth: false,
            reusable: false,
            label: "wires-tile-pattern",
        });

        context.scale(wiresBackgroundDpi, wiresBackgroundDpi);
        context.fillStyle = THEME.map.wires.overlay;
        context.fillRect(0, 0, globalConfig.tileSize, globalConfig.tileSize);

        const lineWidth = 1;

        context.fillRect(0, 0, globalConfig.tileSize, lineWidth);
        context.fillRect(0, lineWidth, lineWidth, globalConfig.tileSize);

        this.tilePatternCanvas = canvas;
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        if (this.root.editMode !== enumEditMode.wires) {
            return;
        }

        if (!this.cachedPatternBackground) {
            this.cachedPatternBackground = parameters.context.createPattern(this.tilePatternCanvas, "repeat");
        }

        const bounds = parameters.visibleRect;

        const scaleFactor = 1 / wiresBackgroundDpi;

        parameters.context.scale(scaleFactor, scaleFactor);
        parameters.context.fillStyle = this.cachedPatternBackground;
        parameters.context.fillRect(
            bounds.x / scaleFactor,
            bounds.y / scaleFactor,
            bounds.w / scaleFactor,
            bounds.h / scaleFactor
        );
        parameters.context.scale(1 / scaleFactor, 1 / scaleFactor);
    }
}
