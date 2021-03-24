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

        this.root.signals.prePlacementCheck.add(this.prePlacementCheck, this);
    }

    prePlacementCheck(entity, tile = null) {
        const staticComp = entity.components.StaticMapEntity;

        if (!staticComp) {
            return;
        }

        const mode = this.root.gameMode;
        const zone = mode.getZone().expandedInAllDirections(-1);
        const transformed = staticComp.getTileSpaceBounds();

        if (zone.containsRect(transformed)) {
            if (mode.isZoneRestricted()) {
                return STOP_PROPAGATION;
            }
        } else {
            if (mode.isBoundaryRestricted()) {
                return STOP_PROPAGATION;
            }
        }
    }

    /**
     * Draws the zone
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const mode = this.root.gameMode;
        const zone = mode.getZone().allScaled(globalConfig.tileSize);
        const context = parameters.context;

        context.globalAlpha = 0.1;
        context.fillStyle = THEME.map.zone.background;
        context.fillRect(zone.x, zone.y, zone.w, zone.h);

        context.globalAlpha = 1;
        context.strokeStyle = THEME.map.zone.border;
        context.lineWidth = 2;
        context.strokeRect(zone.x, zone.y, zone.w, zone.h);

        context.globalAlpha = 1;
    }
}
