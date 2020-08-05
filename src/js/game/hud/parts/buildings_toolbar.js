import { MetaBeltBaseBuilding } from "../../buildings/belt_base";
import { MetaCutterBuilding } from "../../buildings/cutter";
import { MetaEnergyGenerator } from "../../buildings/energy_generator";
import { MetaMinerBuilding } from "../../buildings/miner";
import { MetaMixerBuilding } from "../../buildings/mixer";
import { MetaPainterBuilding } from "../../buildings/painter";
import { MetaRotaterBuilding } from "../../buildings/rotater";
import { MetaSplitterBuilding } from "../../buildings/splitter";
import { MetaStackerBuilding } from "../../buildings/stacker";
import { MetaTrashBuilding } from "../../buildings/trash";
import { MetaUndergroundBeltBuilding } from "../../buildings/underground_belt";
import { HUDBaseToolbar } from "./base_toolbar";
import { MetaAdvancedProcessorBuilding } from "../../buildings/advanced_processor";

const supportedBuildings = [
    MetaBeltBaseBuilding,
    MetaSplitterBuilding,
    MetaUndergroundBeltBuilding,
    MetaMinerBuilding,
    MetaCutterBuilding,
    MetaRotaterBuilding,
    MetaStackerBuilding,
    MetaMixerBuilding,
    MetaPainterBuilding,
    MetaTrashBuilding,

    MetaEnergyGenerator,
    MetaAdvancedProcessorBuilding,
];

export class HUDBuildingsToolbar extends HUDBaseToolbar {
    constructor(root) {
        super(root, {
            supportedBuildings,
            visibilityCondition: () =>
                !this.root.camera.getIsMapOverlayActive() && this.root.currentLayer === "regular",
            htmlElementId: "ingame_HUD_buildings_toolbar",
        });
    }
}
