import { BaseHUDPart } from "../base_hud_part";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { IS_DEMO, globalConfig } from "../../../core/config";
import { T } from "../../../translations";
import { createLogger } from "../../../core/logging";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { Vector } from "../../../core/vector";
import { Math_max, Math_min } from "../../../core/builtins";
import { makeOffscreenBuffer } from "../../../core/buffer_utils";
import { DrawParameters } from "../../../core/draw_parameters";
import { Rectangle } from "../../../core/rectangle";

const logger = createLogger("screenshot_exporter");

export class HUDScreenshotExporter extends BaseHUDPart {
    createElements() {}

    initialize() {
        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.exportScreenshot).add(this.startExport, this);
    }

    startExport() {
        if (IS_DEMO) {
            this.root.hud.parts.dialogs.showFeatureRestrictionInfo(T.demo.features.exportingBase);
            return;
        }

        const { ok } = this.root.hud.parts.dialogs.showInfo(
            T.dialogs.exportScreenshotWarning.title,
            T.dialogs.exportScreenshotWarning.desc,
            ["cancel:good", "ok:bad"]
        );
        ok.add(this.doExport, this);
    }

    doExport() {
        logger.log("Starting export ...");

        // Find extends
        const staticEntities = this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent);

        const minTile = new Vector(0, 0);
        const maxTile = new Vector(0, 0);
        for (let i = 0; i < staticEntities.length; ++i) {
            const bounds = staticEntities[i].components.StaticMapEntity.getTileSpaceBounds();
            minTile.x = Math_min(minTile.x, bounds.x);
            minTile.y = Math_min(minTile.y, bounds.y);

            maxTile.x = Math_max(maxTile.x, bounds.x + bounds.w);
            maxTile.y = Math_max(maxTile.y, bounds.y + bounds.h);
        }

        const minChunk = minTile.divideScalar(globalConfig.mapChunkSize).floor();
        const maxChunk = maxTile.divideScalar(globalConfig.mapChunkSize).ceil();

        const dimensions = maxChunk.sub(minChunk);
        logger.log("Dimensions:", dimensions);

        const chunkSizePixels = 128;
        const chunkScale = chunkSizePixels / (globalConfig.mapChunkSize * globalConfig.tileSize);
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
            minChunk.x * globalConfig.mapChunkSize * globalConfig.tileSize,
            minChunk.y * globalConfig.mapChunkSize * globalConfig.tileSize,
            dimensions.x * globalConfig.mapChunkSize * globalConfig.tileSize,
            dimensions.y * globalConfig.mapChunkSize * globalConfig.tileSize
        );
        const parameters = new DrawParameters({
            context,
            visibleRect,
            desiredAtlasScale: "1",
            root: this.root,
            zoomLevel: chunkScale,
        });

        context.scale(chunkScale, chunkScale);
        context.translate(-visibleRect.x, -visibleRect.y);

        // Render all relevant chunks
        this.root.map.drawBackground(parameters);
        this.root.map.drawForeground(parameters);

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
