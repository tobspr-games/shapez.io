import { gItemRegistry } from "../core/global_registries";
import { ShapeItem } from "./items/shape_item";

export function initItemRegistry() {
    gItemRegistry.register(ShapeItem);
}
