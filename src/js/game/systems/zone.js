/* typehints:start */
import { DrawParameters } from "../../core/draw_parameters";
import { MapChunkView } from "../map_chunk_view";
import { GameRoot } from "../root";
/* typehints:end */

import { globalConfig } from "../../core/config";
import { STOP_PROPAGATION } from "../../core/signal";
import { GameSystem } from "../game_system";
import { THEME } from "../theme";

export class ZoneSystem extends GameSystem {
    /** @param {GameRoot} root */
    constructor(root) {
        super(root);
        this.drawn = false;
        this.root.signals.prePlacementCheck.add(this.prePlacementCheck, this);

        this.root.signals.gameFrameStarted.add(() => {
            this.drawn = false;
        });
    }

    prePlacementCheck(entity, tile = null) {
        const staticComp = entity.components.StaticMapEntity;

        if (!staticComp) {
            return;
        }

        const mode = this.root.gameMode;

        const zones = mode.getBuildableZones();
        if (!zones) {
            return;
        }

        const transformed = staticComp.getTileSpaceBounds();

        let withinAnyZone = false;
        for (const zone of zones) {
            if (zone.expandedInAllDirections(-1).containsRect(transformed)) {
                withinAnyZone = true;
            }
        }

        if (!withinAnyZone) {
            return STOP_PROPAGATION;
        }
    }

    /**
     * Draws the zone
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        if (this.drawn) {
            // oof
            return;
        }
        this.drawn = true;

        const mode = this.root.gameMode;

        const zones = mode.getBuildableZones();
        if (!zones) {
            return;
        }

        const zone = zones[0].allScaled(globalConfig.tileSize);
        const context = parameters.context;

        context.lineWidth = 2;
        context.strokeStyle = THEME.map.zone.borderSolid;
        context.beginPath();
        context.rect(zone.x, zone.y, zone.w, zone.h);

        context.stroke();

        const outer = zone;
        const padding = 40 * globalConfig.tileSize;
        context.fillStyle = THEME.map.zone.outerColor;
        context.fillRect(outer.x + outer.w, outer.y, padding, outer.h);
        context.fillRect(outer.x - padding, outer.y, padding, outer.h);
        context.fillRect(
            outer.x - padding - globalConfig.tileSize,
            outer.y - padding,
            2 * padding + zone.w + 2 * globalConfig.tileSize,
            padding
        );
        context.fillRect(
            outer.x - padding - globalConfig.tileSize,
            outer.y + outer.h,
            2 * padding + zone.w + 2 * globalConfig.tileSize,
            padding
        );

        context.globalAlpha = 1;
    }
}