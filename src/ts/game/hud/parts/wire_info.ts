import { globalConfig } from "../../../core/config";
import { MapChunkView } from "../../map_chunk_view";
import { WireNetwork } from "../../systems/wire";
import { THEME } from "../../theme";
import { BaseHUDPart } from "../base_hud_part";
import { Loader } from "../../../core/loader";
export class HUDWireInfo extends BaseHUDPart {
    initialize(): any {
        this.spriteEmpty = Loader.getSprite("sprites/wires/network_empty.png");
        this.spriteConflict = Loader.getSprite("sprites/wires/network_conflict.png");
    }
        drawOverlays(parameters: import("../../../core/draw_utils").DrawParameters): any {
        if (this.root.currentLayer !== "wires") {
            // Not in the wires layer
            return;
        }
        const mousePos: any = this.root.app.mousePosition;
        if (!mousePos) {
            // No mouse
            return;
        }
        const worldPos: any = this.root.camera.screenToWorld(mousePos);
        const tile: any = worldPos.toTileSpace();
        const entity: any = this.root.map.getLayerContentXY(tile.x, tile.y, "wires");
        if (!entity) {
            // No entity
            return;
        }
        if (!this.root.camera.getIsMapOverlayActive() &&
            !this.root.logic.getIsEntityIntersectedWithMatrix(entity, worldPos)) {
            // Detailed intersection check
            return;
        }
        const networks: any = this.root.logic.getEntityWireNetworks(entity, tile);
        if (networks === null) {
            // This entity will never be able to be connected
            return;
        }
        if (networks.length === 0) {
            // No network at all
            return;
        }
        for (let i: any = 0; i < networks.length; ++i) {
            const network: any = networks[i];
            this.drawHighlightedNetwork(parameters, network);
        }
        if (networks.length === 1) {
            const network: any = networks[0];
            if (network.valueConflict) {
                this.spriteConflict.draw(parameters.context, mousePos.x + 15, mousePos.y - 10, 60, 60);
            }
            else if (!network.currentValue) {
                this.spriteEmpty.draw(parameters.context, mousePos.x + 15, mousePos.y - 10, 60, 60);
            }
            else {
                network.currentValue.drawItemCenteredClipped(mousePos.x + 40, mousePos.y + 10, parameters, 60);
            }
        }
    }
        drawHighlightedNetwork(parameters: import("../../../core/draw_utils").DrawParameters, network: WireNetwork): any {
        parameters.context.globalAlpha = 0.5;
        for (let i: any = 0; i < network.wires.length; ++i) {
            const wire: any = network.wires[i];
            const staticComp: any = wire.components.StaticMapEntity;
            const screenTile: any = this.root.camera.worldToScreen(staticComp.origin.toWorldSpace());
            MapChunkView.drawSingleWiresOverviewTile({
                context: parameters.context,
                x: screenTile.x,
                y: screenTile.y,
                entity: wire,
                tileSizePixels: globalConfig.tileSize * this.root.camera.zoomLevel,
                overrideColor: THEME.map.wires.highlightColor,
            });
        }
        for (let i: any = 0; i < network.tunnels.length; ++i) {
            const tunnel: any = network.tunnels[i];
            const staticComp: any = tunnel.components.StaticMapEntity;
            const screenTile: any = this.root.camera.worldToScreen(staticComp.origin.toWorldSpace());
            MapChunkView.drawSingleWiresOverviewTile({
                context: parameters.context,
                x: screenTile.x,
                y: screenTile.y,
                entity: tunnel,
                tileSizePixels: globalConfig.tileSize * this.root.camera.zoomLevel,
                overrideColor: THEME.map.wires.highlightColor,
            });
        }
        parameters.context.globalAlpha = 1;
    }
}
