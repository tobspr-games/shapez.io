import { types } from "../savegame/serialization";
import { gItemRegistry } from "../core/global_registries";
import { BooleanItem, BOOL_TRUE_SINGLETON, BOOL_FALSE_SINGLETON } from "./items/boolean_item";
import { ShapeItem } from "./items/shape_item";
import { ColorItem, COLOR_ITEM_SINGLETONS } from "./items/color_item";

export const MODS_ADDITIONAL_ITEMS = {};

/**
 * Resolves items so we share instances
 * @param {import("../savegame/savegame_serializer").GameRoot} root
 * @param {{$: string, data: any }} data
 */
export function itemResolverSingleton(root, data) {
    const itemType = data.$;
    const itemData = data.data;

    if (MODS_ADDITIONAL_ITEMS[itemType]) {
        return MODS_ADDITIONAL_ITEMS[itemType](itemData, root);
    }

    switch (itemType) {
        case BooleanItem.getId(): {
            return itemData ? BOOL_TRUE_SINGLETON : BOOL_FALSE_SINGLETON;
        }
        case ShapeItem.getId(): {
            return root.shapeDefinitionMgr.getShapeItemFromShortKey(itemData);
        }
        case ColorItem.getId(): {
            return COLOR_ITEM_SINGLETONS[itemData];
        }

        default: {
            assertAlways(false, "Unknown item type: " + itemType);
        }
    }
}

export const typeItemSingleton = types.obj(gItemRegistry, itemResolverSingleton);
