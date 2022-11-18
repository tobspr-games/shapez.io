import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { TrackedState } from "../../../core/tracked_state";
import { enumColors } from "../../colors";
import { ColorItem } from "../../items/color_item";
import { DrawParameters } from "../../../core/draw_parameters";
import { THEME } from "../../theme";
import { globalConfig } from "../../../core/config";
import { T } from "../../../translations";
export class HUDColorBlindHelper extends BaseHUDPart {
    createElements(parent: any): any {
        this.belowTileIndicator = makeDiv(parent, "ingame_HUD_ColorBlindBelowTileHelper", []);
    }
    initialize(): any {
        this.trackedColorBelowTile = new TrackedState(this.onColorBelowTileChanged, this);
    }
    /**
     * Called when the color below the current tile changed
     */
    onColorBelowTileChanged(color: enumColors | null): any {
        this.belowTileIndicator.classList.toggle("visible", !!color);
        if (color) {
            this.belowTileIndicator.innerText = T.ingame.colors[color];
        }
    }
    /**
     * Computes the color below the current tile
     * {}
     */
    computeColorBelowTile(): enumColors {
        const mousePosition: any = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return null;
        }
        if (this.root.currentLayer !== "regular") {
            // Not in regular mode
            return null;
        }
        const worldPos: any = this.root.camera.screenToWorld(mousePosition);
        const tile: any = worldPos.toTileSpace();
        const contents: any = this.root.map.getTileContent(tile, this.root.currentLayer);
        if (contents && !contents.components.Miner) {
            const beltComp: any = contents.components.Belt;
            // Check if the belt has a color item
            if (beltComp) {
                const item: any = beltComp.assignedPath.findItemAtTile(tile);
                if (item && item.getItemType() === "color") {
                    return item as ColorItem).color;
                }
            }
            // Check if we are ejecting an item, if so use that color
            const ejectorComp: any = contents.components.ItemEjector;
            if (ejectorComp) {
                for (let i: any = 0; i < ejectorComp.slots.length; ++i) {
                    const slot: any = ejectorComp.slots[i];
                    if (slot.item && slot.item.getItemType() === "color") {
                        return slot.item as ColorItem).color;
                    }
                }
            }
        }
        else {
            // We hovered a lower layer, show the color there
            const lowerLayer: any = this.root.map.getLowerLayerContentXY(tile.x, tile.y);
            if (lowerLayer && lowerLayer.getItemType() === "color") {
                return lowerLayer as ColorItem).color;
            }
        }
        return null;
    }
    update(): any {
        this.trackedColorBelowTile.set(this.computeColorBelowTile());
    }
    /**
     * Draws the currently selected tile
     */
    draw(parameters: DrawParameters): any {
        const mousePosition: any = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return null;
        }
        const below: any = this.computeColorBelowTile();
        if (below) {
            // We have something below our tile
            const worldPos: any = this.root.camera.screenToWorld(mousePosition);
            const tile: any = worldPos.toTileSpace().toWorldSpace();
            parameters.context.strokeStyle = THEME.map.colorBlindPickerTile;
            parameters.context.lineWidth = 1;
            parameters.context.beginPath();
            parameters.context.rect(tile.x, tile.y, globalConfig.tileSize, globalConfig.tileSize);
            parameters.context.stroke();
        }
    }
}
