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

        const zone = this.root.gameMode.getZone().expandedInAllDirections(-1);
        const transformed = staticComp.getTileSpaceBounds();

        if (zone.containsRect(transformed)) {
            return STOP_PROPAGATION;
        }
    }

    /**
     * Draws the zone
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const zone = this.root.gameMode.getZone().allScaled(globalConfig.tileSize);
        const context = parameters.context;

        context.globalAlpha = 0.1;
        context.fillStyle = THEME.map.zone.background;
        context.fillRect(zone.x, zone.y, zone.w, zone.h);

        context.globalAlpha = 0.9;
        context.strokeStyle = THEME.map.zone.border;
        context.strokeRect(zone.x, zone.y, zone.w, zone.h);

        context.globalAlpha = 1;
    }
}
