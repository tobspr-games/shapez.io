import { gMetaBuildingRegistry } from "../core/global_registries";
import { MetaBeltBaseBuilding } from "./buildings/belt_base";
import { MetaCutterBuilding } from "./buildings/cutter";
import { MetaMinerBuilding } from "./buildings/miner";
import { MetaMixerBuilding } from "./buildings/mixer";
import { MetaPainterBuilding } from "./buildings/painter";
import { MetaCounterBuilding } from "./buildings/counter";
import { MetaRotaterBuilding } from "./buildings/rotater";
import { MetaSplitterBuilding } from "./buildings/splitter";
import { MetaStackerBuilding } from "./buildings/stacker";
import { MetaTrashBuilding } from "./buildings/trash";
import { MetaUndergroundBeltBuilding } from "./buildings/underground_belt";
import { MetaHubBuilding } from "./buildings/hub";
import { MetaEnergyGenerator } from "./buildings/energy_generator";
import { MetaWireBaseBuilding } from "./buildings/wire_base";
import { MetaAdvancedProcessorBuilding } from "./buildings/advanced_processor";
import { MetaBeltBuilding } from "./buildings/belt";
import { MetaWireCrossingsBuilding } from "./buildings/wire_crossings";

export function initMetaBuildingRegistry() {
    gMetaBuildingRegistry.register(MetaSplitterBuilding);
    gMetaBuildingRegistry.register(MetaMinerBuilding);
    gMetaBuildingRegistry.register(MetaCutterBuilding);
    gMetaBuildingRegistry.register(MetaCounterBuilding);
    gMetaBuildingRegistry.register(MetaRotaterBuilding);
    gMetaBuildingRegistry.register(MetaStackerBuilding);
    gMetaBuildingRegistry.register(MetaMixerBuilding);
    gMetaBuildingRegistry.register(MetaPainterBuilding);
    gMetaBuildingRegistry.register(MetaTrashBuilding);
    gMetaBuildingRegistry.register(MetaBeltBuilding);
    gMetaBuildingRegistry.register(MetaUndergroundBeltBuilding);
    gMetaBuildingRegistry.register(MetaHubBuilding);
    gMetaBuildingRegistry.register(MetaEnergyGenerator);
    gMetaBuildingRegistry.register(MetaWireBaseBuilding);
    gMetaBuildingRegistry.register(MetaAdvancedProcessorBuilding);
    gMetaBuildingRegistry.register(MetaWireCrossingsBuilding);
}
