import { makeOffscreenBuffer } from "../../../core/buffer_utils";
import { globalConfig } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { createLogger } from "../../../core/logging";
import { Rectangle } from "../../../core/rectangle";
import { Vector } from "../../../core/vector";
import { T } from "../../../translations";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { DialogWithForm } from "../../../core/modal_dialog_elements";
import { FormElementCheckbox, FormElementEnum } from "../../../core/modal_dialog_forms";
import { ORIGINAL_SPRITE_SCALE } from "../../../core/sprites";
import { getDeviceDPI } from "../../../core/dpi_manager";

const logger = createLogger("screenshot_exporter");

const screenshotQualities = [
    {
        id: "high",
        resolution: 16384,
    },
    {
        id: "medium",
        resolution: 4096,
    },
    {
        id: "low",
        resolution: 1024,
    },
];
// @TODO: translation (T.dialogs.exportScreenshotWarning.qualities)
const qualityNames = { high: "High", medium: "Medium", low: "Low" };

export class HUDScreenshotExporter extends BaseHUDPart {
    createElements() {}

    initialize() {
        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.exportScreenshot).add(this.startExport, this);
    }

    startExport() {
        if (!this.root.app.restrictionMgr.getIsExportingScreenshotsPossible()) {
            this.root.hud.parts.dialogs.showFeatureRestrictionInfo(T.demo.features.exportingBase);
            return;
        }

        const qualityInput = new FormElementEnum({
            id: "screenshotQuality",
            label: "Quality",
            options: screenshotQualities,
            valueGetter: quality => quality.resolution,
            // @TODO: translation (T.dialogs.exportScreenshotWarning.qualityLabel)
            textGetter: quality => qualityNames[quality.id],
        });
        const overlayInput = new FormElementCheckbox({
            id: "screenshotView",
            // @TODO: translation (T.dialogs.exportScreenshotWarning.descOverlay)
            label: "Map view",
            defaultValue: this.root.camera.getIsMapOverlayActive() ? true : false,
        });
        const layerInput = new FormElementCheckbox({
            id: "screenshotLayer",
            // @TODO: translation (T.dialogs.exportScreenshotWarning.descLayer)
            label: "Include wires layer",
            defaultValue: this.root.currentLayer === "wires" ? true : false,
        });
        const dialog = new DialogWithForm({
            app: this.root.app,
            title: T.dialogs.exportScreenshotWarning.title,
            desc: T.dialogs.exportScreenshotWarning.desc,
            formElements: [qualityInput, overlayInput, layerInput],
            buttons: ["cancel:good", "ok:bad"],
        });

        this.root.hud.parts.dialogs.internalShowDialog(dialog);
        dialog.buttonSignals.ok.add(
            () => this.doExport(qualityInput.getValue(), overlayInput.getValue(), layerInput.getValue()),
            this
        );
    }

    /**
     * Renders a screenshot of the entire base as closely as possible to the ingame camera
     * @param {number} resolution
     * @param {boolean} overlay
     * @param {boolean} wiresLayer
     */
    doExport(resolution, overlay, wiresLayer) {
        logger.log("Starting export ...");

        // Find extends
        const staticEntities = this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent);

        const minTile = new Vector(0, 0);
        const maxTile = new Vector(0, 0);
        for (let i = 0; i < staticEntities.length; ++i) {
            const bounds = staticEntities[i].components.StaticMapEntity.getTileSpaceBounds();
            minTile.x = Math.min(minTile.x, bounds.x);
            minTile.y = Math.min(minTile.y, bounds.y);

            maxTile.x = Math.max(maxTile.x, bounds.x + bounds.w);
            maxTile.y = Math.max(maxTile.y, bounds.y + bounds.h);
        }

        const minChunk = minTile.divideScalar(globalConfig.mapChunkSize).floor();
        const maxChunk = maxTile.divideScalar(globalConfig.mapChunkSize).ceil();

        const dimensions = maxChunk.sub(minChunk);
        logger.log("Dimensions:", dimensions);

        const maxDimensions = Math.max(dimensions.x, dimensions.y);

        // we want integer pixels per tile
        // if resolution too low, we want integer pixels per chunk
        const chunkSizePixels =
            maxDimensions * globalConfig.mapChunkSize > resolution
                ? Math.max(1, Math.floor(resolution / maxDimensions))
                : Math.floor(resolution / (maxDimensions * globalConfig.mapChunkSize)) *
                  globalConfig.mapChunkSize;
        logger.log("ChunkSizePixels:", chunkSizePixels);

        // equivalent to zoomLevel
        const chunkScale = chunkSizePixels / globalConfig.mapChunkWorldSize;
        logger.log("Scale:", chunkScale);

        // Compute atlas scale
        const lowQuality = this.root.app.settings.getAllSettings().lowQualityTextures;
        const effectiveZoomLevel =
            (chunkScale / globalConfig.assetsDpi) * getDeviceDPI() * globalConfig.assetsSharpness;

        let desiredAtlasScale = "0.25";
        if (effectiveZoomLevel > 0.5 && !lowQuality) {
            desiredAtlasScale = ORIGINAL_SPRITE_SCALE;
        } else if (effectiveZoomLevel > 0.35 && !lowQuality) {
            desiredAtlasScale = "0.5";
        }

        logger.log("Allocating buffer, if the factory grew too big it will crash here");
        const [canvas, context] = makeOffscreenBuffer(
            dimensions.x * chunkSizePixels,
            dimensions.y * chunkSizePixels,
            {
                smooth: true,
                reusable: false,
                label: "export-buffer",
            }
        );
        logger.log("Got buffer, rendering now ...");

        const visibleRect = new Rectangle(
            minChunk.x * globalConfig.mapChunkWorldSize,
            minChunk.y * globalConfig.mapChunkWorldSize,
            dimensions.x * globalConfig.mapChunkWorldSize,
            dimensions.y * globalConfig.mapChunkWorldSize
        );
        const parameters = new DrawParameters({
            context,
            visibleRect,
            desiredAtlasScale,
            root: this.root,
            zoomLevel: chunkScale,
        });

        context.scale(chunkScale, chunkScale);
        context.translate(-visibleRect.x, -visibleRect.y);

        // hack but works
        const currentLayer = this.root.currentLayer;
        const currentAlpha = this.root.hud.parts.wiresOverlay.currentAlpha;
        if (wiresLayer) {
            this.root.currentLayer = "wires";
            this.root.hud.parts.wiresOverlay.currentAlpha = 1;
        } else {
            this.root.currentLayer = "regular";
            this.root.hud.parts.wiresOverlay.currentAlpha = 0;
        }

        // Render all relevant chunks
        this.root.signals.gameFrameStarted.dispatch();
        if (overlay) {
            this.root;
            this.root.map.drawOverlay(parameters);
        } else {
            this.root.map.drawBackground(parameters);
            this.root.systemMgr.systems.belt.drawBeltItems(parameters);
            this.root.map.drawForeground(parameters);
            this.root.systemMgr.systems.hub.draw(parameters);
            this.root.hud.parts.wiresOverlay.draw(parameters);
            if (this.root.currentLayer === "wires") {
                this.root.map.drawWiresForegroundLayer(parameters);
            }
        }

        this.root.currentLayer = currentLayer;
        this.root.hud.parts.wiresOverlay.currentAlpha = currentAlpha;

        // Offer export
        logger.log("Rendered buffer, exporting ...");
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "base.png";
        link.href = image;
        link.click();
        logger.log("Done!");
    }
}
