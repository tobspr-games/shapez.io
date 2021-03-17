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
import { FormElementInput, FormElementCheckbox, FormElementEnum } from "../../../core/modal_dialog_forms";

const logger = createLogger("screenshot_exporter");

/**
 * @typedef {{mode: string, resolution?: number}} QualityOptions
 */

/**
 * @type {{id: string, options: QualityOptions}[]}
 */
const screenshotQualities = [
    {
        id: "high",
        options: { mode: "regular", resolution: 16384 },
    },
    {
        id: "medium",
        options: { mode: "regular", resolution: 4096 },
    },
    {
        id: "low",
        options: { mode: "regular", resolution: 1024 },
    },
    {
        id: "map",
        options: { mode: "map" },
    },
];
// @TODO: translation (T.dialogs.exportScreenshotWarning.qualities)
const qualityNames = { high: "High", medium: "Medium", low: "Low", map: "Map" };

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
            options: screenshotQualities,
            valueGetter: quality => quality.options,
            // @TODO: translation (T.dialogs.exportScreenshotWarning.qualityLabel)
            textGetter: quality => "Quality:" + " " + qualityNames[quality.id],
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
            formElements: [qualityInput, layerInput],
            buttons: ["cancel:good", "ok:bad"],
        });

        this.root.hud.parts.dialogs.internalShowDialog(dialog);
        dialog.buttonSignals.ok.add(
            () => this.doExport(layerInput.getValue(), qualityInput.getValue()),
            this
        );
    }

    /**
     * @param {boolean} wiresLayer
     * @param {QualityOptions} options
     */
    doExport(wiresLayer, options) {
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
            maxDimensions * globalConfig.mapChunkSize > options.resolution
                ? Math.max(1, Math.floor(options.resolution / maxDimensions))
                : Math.floor(options.resolution / (maxDimensions * globalConfig.mapChunkSize)) *
                  globalConfig.mapChunkSize;
        logger.log("ChunkSizePixels:", chunkSizePixels);

        const chunkScale = chunkSizePixels / globalConfig.mapChunkWorldSize;
        logger.log("Scale:", chunkScale);

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
            desiredAtlasScale: 0.25,
            root: this.root,
            zoomLevel: chunkScale,
        });

        context.scale(chunkScale, chunkScale);
        context.translate(-visibleRect.x, -visibleRect.y);

        // Render all relevant chunks
        this.root.signals.gameFrameStarted.dispatch();
        this.root.map.drawBackground(parameters);
        this.root.systemMgr.systems.belt.drawBeltItems(parameters);
        this.root.map.drawForeground(parameters);
        this.root.systemMgr.systems.hub.draw(parameters);
        if (wiresLayer) {
            this.root.hud.parts.wiresOverlay.draw(parameters, true);
            this.root.map.drawWiresForegroundLayer(parameters);
        }

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
