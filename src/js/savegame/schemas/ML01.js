import { createLogger } from "../../core/logging.js";
import { MetaAnalyzerBuilding } from "../../game/buildings/analyzer.js";
import { MetaBalancerBuilding } from "../../game/buildings/balancer.js";
import { MetaBeltBuilding } from "../../game/buildings/belt.js";
import { MetaComparatorBuilding } from "../../game/buildings/comparator.js";
import { MetaConstantSignalBuilding } from "../../game/buildings/constant_signal.js";
import { MetaCutterBuilding } from "../../game/buildings/cutter.js";
import { MetaDisplayBuilding } from "../../game/buildings/display.js";
import { MetaFilterBuilding } from "../../game/buildings/filter.js";
import { MetaHubBuilding } from "../../game/buildings/hub.js";
import { MetaItemProducerBuilding } from "../../game/buildings/item_producer.js";
import { MetaLeverBuilding } from "../../game/buildings/lever.js";
import { MetaLogicGateBuilding } from "../../game/buildings/logic_gate.js";
import { MetaMinerBuilding } from "../../game/buildings/miner.js";
import { MetaMixerBuilding } from "../../game/buildings/mixer.js";
import { MetaPainterBuilding } from "../../game/buildings/painter.js";
import { MetaReaderBuilding } from "../../game/buildings/reader.js";
import { MetaRotaterBuilding } from "../../game/buildings/rotater.js";
import { MetaStackerBuilding } from "../../game/buildings/stacker.js";
import { MetaStorageBuilding } from "../../game/buildings/storage.js";
import { MetaTransistorBuilding } from "../../game/buildings/transistor.js";
import { MetaTrashBuilding } from "../../game/buildings/trash.js";
import { MetaUndergroundBeltBuilding } from "../../game/buildings/underground_belt.js";
import { MetaVirtualProcessorBuilding } from "../../game/buildings/virtual_processor.js";
import { MetaWireBuilding } from "../../game/buildings/wire.js";
import { MetaWireTunnelBuilding } from "../../game/buildings/wire_tunnel.js";
import { getCodeFromBuildingData } from "../../game/building_codes.js";
import { defaultBuildingVariant } from "../../game/meta_building.js";
import { SavegameInterface_V1007 } from "./1007.js";

const schema = require("./ML01.json");
const logger = createLogger("savegame_interface/modloader");

export const codes = {
    // Belt
    1: getCodeFromBuildingData(new MetaBeltBuilding(), defaultBuildingVariant),
    2: getCodeFromBuildingData(new MetaBeltBuilding(), defaultBuildingVariant, 1),
    3: getCodeFromBuildingData(new MetaBeltBuilding(), defaultBuildingVariant, 2),

    // Balancer
    4: getCodeFromBuildingData(new MetaBalancerBuilding(), defaultBuildingVariant),
    5: getCodeFromBuildingData(new MetaBalancerBuilding(), MetaBalancerBuilding.variants.merger),
    6: getCodeFromBuildingData(new MetaBalancerBuilding(), MetaBalancerBuilding.variants.mergerInverse),
    47: getCodeFromBuildingData(new MetaBalancerBuilding(), MetaBalancerBuilding.variants.splitter),
    48: getCodeFromBuildingData(new MetaBalancerBuilding(), MetaBalancerBuilding.variants.splitterInverse),

    // Miner
    7: getCodeFromBuildingData(new MetaMinerBuilding(), defaultBuildingVariant),
    8: getCodeFromBuildingData(new MetaMinerBuilding(), MetaMinerBuilding.variants.chainable),

    // Cutter
    9: getCodeFromBuildingData(new MetaCutterBuilding(), defaultBuildingVariant),
    10: getCodeFromBuildingData(new MetaCutterBuilding(), MetaCutterBuilding.variants.quad),

    // Rotater
    11: getCodeFromBuildingData(new MetaRotaterBuilding(), defaultBuildingVariant),
    12: getCodeFromBuildingData(new MetaRotaterBuilding(), MetaRotaterBuilding.variants.ccw),
    13: getCodeFromBuildingData(new MetaRotaterBuilding(), MetaRotaterBuilding.variants.rotate180),

    // Stacker
    14: getCodeFromBuildingData(new MetaStackerBuilding(), defaultBuildingVariant),

    // Mixer
    15: getCodeFromBuildingData(new MetaMixerBuilding(), defaultBuildingVariant),

    // Painter
    16: getCodeFromBuildingData(new MetaPainterBuilding(), defaultBuildingVariant),
    17: getCodeFromBuildingData(new MetaPainterBuilding(), MetaPainterBuilding.variants.mirrored),
    18: getCodeFromBuildingData(new MetaPainterBuilding(), MetaPainterBuilding.variants.double),
    19: getCodeFromBuildingData(new MetaPainterBuilding(), MetaPainterBuilding.variants.quad),

    // Trash
    20: getCodeFromBuildingData(new MetaTrashBuilding(), defaultBuildingVariant),

    // Storage
    21: getCodeFromBuildingData(new MetaStorageBuilding(), defaultBuildingVariant),

    // Underground belt
    22: getCodeFromBuildingData(new MetaUndergroundBeltBuilding(), defaultBuildingVariant),
    23: getCodeFromBuildingData(new MetaUndergroundBeltBuilding(), defaultBuildingVariant, 1),
    24: getCodeFromBuildingData(
        new MetaUndergroundBeltBuilding(),
        MetaUndergroundBeltBuilding.variants.tier2
    ),
    25: getCodeFromBuildingData(
        new MetaUndergroundBeltBuilding(),
        MetaUndergroundBeltBuilding.variants.tier2,
        1
    ),

    // Hub
    26: getCodeFromBuildingData(new MetaHubBuilding(), defaultBuildingVariant),

    // Wire
    27: getCodeFromBuildingData(new MetaWireBuilding(), defaultBuildingVariant),
    28: getCodeFromBuildingData(new MetaWireBuilding(), defaultBuildingVariant, 1),
    29: getCodeFromBuildingData(new MetaWireBuilding(), defaultBuildingVariant, 2),
    30: getCodeFromBuildingData(new MetaWireBuilding(), defaultBuildingVariant, 3),

    52: getCodeFromBuildingData(new MetaWireBuilding(), MetaWireBuilding.variants.second),
    53: getCodeFromBuildingData(new MetaWireBuilding(), MetaWireBuilding.variants.second, 1),
    54: getCodeFromBuildingData(new MetaWireBuilding(), MetaWireBuilding.variants.second, 2),
    55: getCodeFromBuildingData(new MetaWireBuilding(), MetaWireBuilding.variants.second, 3),

    // Constant signal
    31: getCodeFromBuildingData(new MetaConstantSignalBuilding(), defaultBuildingVariant),

    // Logic gate
    32: getCodeFromBuildingData(new MetaLogicGateBuilding(), defaultBuildingVariant),
    34: getCodeFromBuildingData(new MetaLogicGateBuilding(), MetaLogicGateBuilding.variants.not),
    35: getCodeFromBuildingData(new MetaLogicGateBuilding(), MetaLogicGateBuilding.variants.xor),
    36: getCodeFromBuildingData(new MetaLogicGateBuilding(), MetaLogicGateBuilding.variants.or),

    // Transistor
    38: getCodeFromBuildingData(new MetaTransistorBuilding(), defaultBuildingVariant),
    60: getCodeFromBuildingData(new MetaTransistorBuilding(), MetaTransistorBuilding.variants.mirrored),

    // Lever
    33: getCodeFromBuildingData(new MetaLeverBuilding(), defaultBuildingVariant),

    // Filter
    37: getCodeFromBuildingData(new MetaFilterBuilding(), defaultBuildingVariant),

    // Wire tunnel
    39: getCodeFromBuildingData(new MetaWireTunnelBuilding(), defaultBuildingVariant),

    // Display
    40: getCodeFromBuildingData(new MetaDisplayBuilding(), defaultBuildingVariant),

    // Virtual Processor
    42: getCodeFromBuildingData(new MetaVirtualProcessorBuilding(), defaultBuildingVariant),
    44: getCodeFromBuildingData(
        new MetaVirtualProcessorBuilding(),
        MetaVirtualProcessorBuilding.variants.rotater
    ),
    45: getCodeFromBuildingData(
        new MetaVirtualProcessorBuilding(),
        MetaVirtualProcessorBuilding.variants.unstacker
    ),
    50: getCodeFromBuildingData(
        new MetaVirtualProcessorBuilding(),
        MetaVirtualProcessorBuilding.variants.stacker
    ),
    51: getCodeFromBuildingData(
        new MetaVirtualProcessorBuilding(),
        MetaVirtualProcessorBuilding.variants.painter
    ),

    // Analyzer
    46: getCodeFromBuildingData(new MetaComparatorBuilding(), defaultBuildingVariant),
    43: getCodeFromBuildingData(new MetaAnalyzerBuilding(), defaultBuildingVariant),

    // Reader
    49: getCodeFromBuildingData(new MetaReaderBuilding(), defaultBuildingVariant),

    // Item producer
    61: getCodeFromBuildingData(new MetaItemProducerBuilding(), defaultBuildingVariant),
};

export class SavegameInterface_ML01 extends SavegameInterface_V1007 {
    // @ts-ignore
    getVersion() {
        return "ML01";
    }

    getSchemaUncached() {
        return schema;
    }

    /**
     * @param {import("../savegame_typedefs.js").SavegameData} data
     */
    static migrate1007toML01(data) {
        logger.log("Migrating 1007 to ML01");
        const dump = data.dump;
        if (!dump) {
            return true;
        }

        for (let i = 0; i < dump.entities.length; i++) {
            dump.entities[i].components.StaticMapEntity.code =
                codes[dump.entities[i].components.StaticMapEntity.code];
        }
    }
}