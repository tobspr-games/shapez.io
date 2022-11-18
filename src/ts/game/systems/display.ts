import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import { BaseItem } from "../base_item";
import { enumColors } from "../colors";
import { GameSystem } from "../game_system";
import { isTrueItem } from "../items/boolean_item";
import { ColorItem, COLOR_ITEM_SINGLETONS } from "../items/color_item";
import { MapChunkView } from "../map_chunk_view";
export const MODS_ADDITIONAL_DISPLAY_ITEM_RESOLVER: {
    [x: string]: (item: BaseItem) => BaseItem;
} = {};
export const MODS_ADDITIONAL_DISPLAY_ITEM_DRAW: {
    [x: string]: (parameters: import("../../core/draw_parameters").DrawParameters, entity: import("../entity").Entity, item: BaseItem) => BaseItem;
} = {};
export class DisplaySystem extends GameSystem {
    public displaySprites: {
        [idx: string]: import("../../core/draw_utils").AtlasSprite;
    } = {};

    constructor(root) {
        super(root);
        for (const colorId: any in enumColors) {
            if (colorId === enumColors.uncolored) {
                continue;
            }
            this.displaySprites[colorId] = Loader.getSprite("sprites/wires/display/" + colorId + ".png");
        }
    }
    /**
     * Returns the color / value a display should show
     * {}
     */
    getDisplayItem(value: BaseItem): BaseItem {
        if (!value) {
            return null;
        }
        if (MODS_ADDITIONAL_DISPLAY_ITEM_RESOLVER[value.getItemType()]) {
            return MODS_ADDITIONAL_DISPLAY_ITEM_RESOLVER[value.getItemType()].apply(this, [value]);
        }
        switch (value.getItemType()) {
            case "boolean": {
                return isTrueItem(value) ? COLOR_ITEM_SINGLETONS[enumColors.white] : null;
            }
            case "color": {
                const item: any = (value as ColorItem);
                return item.color === enumColors.uncolored ? null : item;
            }
            case "shape": {
                return value;
            }
            default:
                assertAlways(false, "Unknown item type: " + value.getItemType());
        }
    }
    /**
     * Draws a given chunk
     */
    drawChunk(parameters: import("../../core/draw_utils").DrawParameters, chunk: MapChunkView): any {
        const contents: any = chunk.containedEntitiesByLayer.regular;
        for (let i: any = 0; i < contents.length; ++i) {
            const entity: any = contents[i];
            if (entity && entity.components.Display) {
                const pinsComp: any = entity.components.WiredPins;
                const network: any = pinsComp.slots[0].linkedNetwork;
                if (!network || !network.hasValue()) {
                    continue;
                }
                const value: any = this.getDisplayItem(network.currentValue);
                if (!value) {
                    continue;
                }
                if (MODS_ADDITIONAL_DISPLAY_ITEM_DRAW[value.getItemType()]) {
                    return MODS_ADDITIONAL_DISPLAY_ITEM_DRAW[value.getItemType()].apply(this, [
                        parameters,
                        entity,
                        value,
                    ]);
                }
                const origin: any = entity.components.StaticMapEntity.origin;
                if (value.getItemType() === "color") {
                    this.displaySprites[ alue as ColorItem).color].drawCachedCentered(parameters, (origin.x + 0.5) * globalConfig.tileSize, (origin.y + 0.5) * globalConfig.tileSize, globalConfig.tileSize);
                }
                else if (value.getItemType() === "shape") {
                    value.drawItemCenteredClipped((origin.x + 0.5) * globalConfig.tileSize, (origin.y + 0.5) * globalConfig.tileSize, parameters, 30);
                }
            }
        }
    }
}
