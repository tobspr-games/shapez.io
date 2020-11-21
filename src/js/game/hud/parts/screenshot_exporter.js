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
import { FormElementInput, FormElementCheckbox } from "../../../core/modal_dialog_forms";

const logger = createLogger("screenshot_exporter");

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

        const layerInput = new FormElementCheckbox({
            id: "screenshotLayer",
            label: "Include wires layer",
            defaultValue: this.root.currentLayer === "wires" ? true : false,
        });
        const qualityInput = new FormElementInput({
            id: "screenshotQuality",
            label: "Pixel width per tile",
            placeholder: "",
            defaultValue: "",
            validator: val => !isNaN(val) && parseInt(val) === parseFloat(val) && !isNaN(parseInt(val, 10)),
        });
        const dialog = new DialogWithForm({
            app: this.root.app,
            title: T.dialogs.exportScreenshotWarning.title,
            desc: T.dialogs.exportScreenshotWarning.desc,
            formElements: [layerInput, qualityInput],
            buttons: ["cancel:good", "ok:bad"],
        });

        this.root.hud.parts.dialogs.internalShowDialog(dialog);
        dialog.buttonSignals.ok.add(
            () => this.doExport(layerInput.getValue(), qualityInput.getValue()),
            this
        );
    }

    doExport(wiresLayer, quality) {
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

        let chunkSizePixels = quality * globalConfig.mapChunkSize;
        const maxDimensions = Math.max(dimensions.x, dimensions.y);

        if (maxDimensions > 128) {
            chunkSizePixels = Math.max(1, Math.floor(chunkSizePixels * (128 / maxDimensions)));
        }
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
