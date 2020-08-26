import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import { BaseItem } from "../base_item";
import { enumColors } from "../colors";
import { DisplayComponent } from "../components/display";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { ColorItem, COLOR_ITEM_SINGLETONS } from "../items/color_item";
import { MapChunkView } from "../map_chunk_view";
import { BooleanItem } from "../items/boolean_item";

export class DisplaySystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [DisplayComponent]);

        /** @type {Object<string, import("../../core/draw_utils").AtlasSprite>} */
        this.displaySprites = {};

        for (const colorId in enumColors) {
            if (colorId === enumColors.uncolored) {
                continue;
            }
            this.displaySprites[colorId] = Loader.getSprite("sprites/wires/display/" + colorId + ".png");
        }
    }

    /**
     * Returns the color / value a display should show
     * @param {BaseItem} value
     * @returns {BaseItem}
     */
    getDisplayItem(value) {
        if (!value) {
            return null;
        }

        switch (value.getItemType()) {
            case "boolean": {
                return /** @type {BooleanItem} */ (value).value
                    ? COLOR_ITEM_SINGLETONS[enumColors.white]
                    : null;
            }

            case "color": {
                const item = /**@type {ColorItem} */ (value);
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
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            if (entity && entity.components.Display) {
                const pinsComp = entity.components.WiredPins;
                const network = pinsComp.slots[0].linkedNetwork;

                if (!network || !network.currentValue) {
                    continue;
                }

                const value = this.getDisplayItem(network.currentValue);

                if (!value) {
                    continue;
                }

                const origin = entity.components.StaticMapEntity.origin;
                if (value.getItemType() === "color") {
                    this.displaySprites[/** @type {ColorItem} */ (value).color].drawCachedCentered(
                        parameters,
                        (origin.x + 0.5) * globalConfig.tileSize,
                        (origin.y + 0.5) * globalConfig.tileSize,
                        globalConfig.tileSize
                    );
                } else if (value.getItemType() === "shape") {
                    value.drawItemCenteredClipped(
                        (origin.x + 0.5) * globalConfig.tileSize,
                        (origin.y + 0.5) * globalConfig.tileSize,
                        parameters,
                        30
                    );
                }
            }
        }
    }
}
