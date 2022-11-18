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
const logger: any = createLogger("screenshot_exporter");
export class HUDScreenshotExporter extends BaseHUDPart {
    createElements(): any { }
    initialize(): any {
        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.exportScreenshot).add(this.startExport, this);
    }
    startExport(): any {
        if (!this.root.app.restrictionMgr.getIsExportingScreenshotsPossible()) {
            this.root.hud.parts.dialogs.showFeatureRestrictionInfo(T.demo.features.exportingBase);
            return;
        }
        const { ok }: any = this.root.hud.parts.dialogs.showInfo(T.dialogs.exportScreenshotWarning.title, T.dialogs.exportScreenshotWarning.desc, ["cancel:good", "ok:bad"]);
        ok.add(this.doExport, this);
    }
    doExport(): any {
        logger.log("Starting export ...");
        // Find extends
        const staticEntities: any = this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent);
        const minTile: any = new Vector(0, 0);
        const maxTile: any = new Vector(0, 0);
        for (let i: any = 0; i < staticEntities.length; ++i) {
            const bounds: any = staticEntities[i].components.StaticMapEntity.getTileSpaceBounds();
            minTile.x = Math.min(minTile.x, bounds.x);
            minTile.y = Math.min(minTile.y, bounds.y);
            maxTile.x = Math.max(maxTile.x, bounds.x + bounds.w);
            maxTile.y = Math.max(maxTile.y, bounds.y + bounds.h);
        }
        const minChunk: any = minTile.divideScalar(globalConfig.mapChunkSize).floor();
        const maxChunk: any = maxTile.divideScalar(globalConfig.mapChunkSize).ceil();
        const dimensions: any = maxChunk.sub(minChunk);
        logger.log("Dimensions:", dimensions);
        let chunkSizePixels: any = 128;
        const maxDimensions: any = Math.max(dimensions.x, dimensions.y);
        if (maxDimensions > 128) {
            chunkSizePixels = Math.max(1, Math.floor(128 * (128 / maxDimensions)));
        }
        logger.log("ChunkSizePixels:", chunkSizePixels);
        const chunkScale: any = chunkSizePixels / globalConfig.mapChunkWorldSize;
        logger.log("Scale:", chunkScale);
        logger.log("Allocating buffer, if the factory grew too big it will crash here");
        const [canvas, context]: any = makeOffscreenBuffer(dimensions.x * chunkSizePixels, dimensions.y * chunkSizePixels, {
            smooth: true,
            reusable: false,
            label: "export-buffer",
        });
        logger.log("Got buffer, rendering now ...");
        const visibleRect: any = new Rectangle(minChunk.x * globalConfig.mapChunkWorldSize, minChunk.y * globalConfig.mapChunkWorldSize, dimensions.x * globalConfig.mapChunkWorldSize, dimensions.y * globalConfig.mapChunkWorldSize);
        const parameters: any = new DrawParameters({
            context,
            visibleRect,
            desiredAtlasScale: 0.25,
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
        const image: any = canvas.toDataURL("image/png");
        const link: any = document.createElement("a");
        link.download = "base.png";
        link.href = image;
        link.click();
        logger.log("Done!");
    }
}
