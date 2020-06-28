import { gItemRegistry } from "../core/global_registries";
import { ShapeItem } from "./items/shape_item";
import { ColorItem } from "./items/color_item";
import { PositiveEnergyItem } from "./items/positive_energy_item";
import { NegativeEnergyItem } from "./items/negative_energy_item";

export function initItemRegistry() {
    gItemRegistry.register(ShapeItem);
    gItemRegistry.register(ColorItem);
    gItemRegistry.register(PositiveEnergyItem);
    gItemRegistry.register(NegativeEnergyItem);
}
