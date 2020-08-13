import { BaseHUDPart } from "../base_hud_part";
import { enumLayer } from "../../root";
import { globalConfig } from "../../../core/config";

export class HUDWireInfo extends BaseHUDPart {
    initialize() {}

    /**
     *
     * @param {import("../../../core/draw_utils").DrawParameters} parameters
     */
    drawOverlays(parameters) {
        if (this.root.currentLayer !== enumLayer.wires) {
            // Not in the wires layer
            return;
        }

        const mousePos = this.root.app.mousePosition;
        if (!mousePos) {
            // No mouse
            return;
        }

        const tile = this.root.camera.screenToWorld(mousePos).toTileSpace();
        const entity = this.root.map.getLayerContentXY(tile.x, tile.y, enumLayer.wires);

        if (entity) {
            const wireComp = entity.components.Wire;
            if (wireComp) {
                const screenTile = this.root.camera.worldToScreen(tile.toWorldSpace());
                parameters.context.fillStyle = "rgba(0, 0, 0, 0.1)";
                parameters.context.fillRect(
                    screenTile.x,
                    screenTile.y,
                    globalConfig.tileSize * this.root.camera.zoomLevel,
                    globalConfig.tileSize * this.root.camera.zoomLevel
                );

                parameters.context.font = "25px GameFont";
                const network = wireComp.linkedNetwork;
                if (!network) {
                    parameters.context.fillStyle = "#333";
                    parameters.context.fillText("empty", mousePos.x, mousePos.y);
                } else {
                    if (network.valueConflict) {
                        parameters.context.fillStyle = "#a10";
                        parameters.context.fillText("conflict", mousePos.x, mousePos.y);
                    } else if (!network.currentValue) {
                        parameters.context.fillStyle = "#333";
                        parameters.context.fillText("empty", mousePos.x, mousePos.y);
                    } else {
                        network.currentValue.draw(mousePos.x + 20, mousePos.y, parameters, 40);
                    }
                }
            }
        }
    }
}
