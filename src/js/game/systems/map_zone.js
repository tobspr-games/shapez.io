/* typehints:start */
import { DrawParameters } from "../../core/draw_parameters";
import { MapChunkView } from "../map_chunk_view";
/* typehints:end */

import { globalConfig } from "../../core/config";
import { drawSpriteClipped } from "../../core/draw_utils";
import { GameSystem } from "../game_system";
import { THEME } from "../theme";

export class MapZoneSystem extends GameSystem {
    /**
     * Draws the map resources
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const width = this.root.gameMode.getZoneWidth();
        const height = this.root.gameMode.getZoneHeight();

        const zoneChunkBackground = this.root.buffers.getForKey({
            key: "mapzonebg",
            subKey: chunk.renderKey,
            w: width,
            h: height,
            dpi: 1,
            redrawMethod: this.generateChunkBackground.bind(this, chunk),
        });

        parameters.context.imageSmoothingEnabled = false;
        drawSpriteClipped({
            parameters,
            sprite: zoneChunkBackground,
            x: -width,
            y: -height,
            w: this.root.gameMode.getBoundaryWidth(),
            h: this.root.gameMode.getBoundaryHeight(),
            originalW: width,
            originalH: height,
        });
        parameters.context.imageSmoothingEnabled = true;
    }

    /**
     * @param {MapChunkView} chunk
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    generateChunkBackground(chunk, canvas, context, w, h, dpi) {
        context.clearRect(0, 0, w, h);

        context.fillStyle = THEME.map.zone.background;
        context.strokeStyle = THEME.map.zone.border;
        context.fillRect(0, 0, w, h);
        context.strokeRect(0, 0, w, h);
    }
}
