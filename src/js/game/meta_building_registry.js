import { gMetaBuildingRegistry } from "../core/global_registries";
import { createLogger } from "../core/logging";
import { DefaultBeltVariant, MetaBeltBuilding } from "./buildings/belt";
import { DefaultBeltBaseVariant, MetaBeltBaseBuilding } from "./buildings/belt_base";
import {
    DefaultCutterVariant,
    enumCutterVariants,
    MetaCutterBuilding,
    QuadCutterVariant,
} from "./buildings/cutter";
import { DefaultHubVariant, MetaHubBuilding } from "./buildings/hub";
import {
    ChainableMinerVariant,
    DefaultMinerVariant,
    enumMinerVariants,
    MetaMinerBuilding,
} from "./buildings/miner";
import { DefaultMixerVariant, MetaMixerBuilding } from "./buildings/mixer";
import {
    DefaultPainterVariant,
    DoublePainterVariant,
    enumPainterVariants,
    MetaPainterBuilding,
    MirroredPainterVariant,
    QuadPainterVariant,
} from "./buildings/painter";
import {
    CCWRotaterVariant,
    DefaultRotaterVariant,
    enumRotaterVariants,
    FLRotaterVariant,
    MetaRotaterBuilding,
} from "./buildings/rotater";
import {
    CompactInverseMergerVariant,
    CompactInverseSplitterVariant,
    CompactMergerVariant,
    CompactSplitterVariant,
    DefaultSplitterVariant,
    enumSplitterVariants,
    MetaSplitterBuilding,
} from "./buildings/splitter";
import { DefaultStackerVariant, MetaStackerBuilding } from "./buildings/stacker";
import {
    DefaultTrashVariant,
    enumTrashVariants,
    MetaTrashBuilding,
    StorageTrashVariant,
} from "./buildings/trash";
import {
    DefaultUndergroundBeltVariant,
    enumUndergroundBeltVariants,
    MetaUndergroundBeltBuilding,
    Tier2UndergroundBeltVariant,
} from "./buildings/underground_belt";
import { DefaultWireVariant, MetaWireBuilding } from "./buildings/wire";
import { gBuildingVariants, registerBuildingVariant } from "./building_codes";
import { defaultBuildingVariant } from "./meta_building";
import { DefaultConstantSignalVariant, MetaConstantSignalBuilding } from "./buildings/constant_signal";
import {
    MetaLogicGateBuilding,
    enumLogicGateVariants,
    ANDGateVariant,
    NOTGateVariant,
    XORGateVariant,
    ORGateVariant,
    TransistorVariant,
} from "./buildings/logic_gate";
import { DefaultLeverVariant, MetaLeverBuilding } from "./buildings/lever";
import { DefaultFilterVariant, MetaFilterBuilding } from "./buildings/filter";
import {
    MetaWireTunnelBuilding,
    enumWireTunnelVariants,
    DefaultWireTunnelVariant,
    CoatedWireTunnelVariant,
} from "./buildings/wire_tunnel";
import { DefaultDisplayVariant, MetaDisplayBuilding } from "./buildings/display";
import {
    MetaVirtualProcessorBuilding,
    enumVirtualProcessorVariants,
    CutterVirtualProcessorVariant,
    AnalyzerVirtualProcessorVariant,
    RotaterVirtualProcessorVariant,
    UnstackerVirtualProcessorVariant,
    ShapeCompareProcessorVariant,
} from "./buildings/virtual_processor";
import { DefaultReaderVariant, MetaReaderBuilding } from "./buildings/reader";

const logger = createLogger("building_registry");

export function initMetaBuildingRegistry() {
    gMetaBuildingRegistry.register(MetaSplitterBuilding);
    gMetaBuildingRegistry.register(MetaMinerBuilding);
    gMetaBuildingRegistry.register(MetaCutterBuilding);
    gMetaBuildingRegistry.register(MetaRotaterBuilding);
    gMetaBuildingRegistry.register(MetaStackerBuilding);
    gMetaBuildingRegistry.register(MetaMixerBuilding);
    gMetaBuildingRegistry.register(MetaPainterBuilding);
    gMetaBuildingRegistry.register(MetaTrashBuilding);
    gMetaBuildingRegistry.register(MetaBeltBuilding);
    gMetaBuildingRegistry.register(MetaUndergroundBeltBuilding);
    gMetaBuildingRegistry.register(MetaHubBuilding);
    gMetaBuildingRegistry.register(MetaWireBuilding);
    gMetaBuildingRegistry.register(MetaConstantSignalBuilding);
    gMetaBuildingRegistry.register(MetaLogicGateBuilding);
    gMetaBuildingRegistry.register(MetaLeverBuilding);
    gMetaBuildingRegistry.register(MetaFilterBuilding);
    gMetaBuildingRegistry.register(MetaWireTunnelBuilding);
    gMetaBuildingRegistry.register(MetaDisplayBuilding);
    gMetaBuildingRegistry.register(MetaVirtualProcessorBuilding);
    gMetaBuildingRegistry.register(MetaReaderBuilding);

    // Belt
    registerBuildingVariant(1, MetaBeltBaseBuilding, DefaultBeltVariant, 0);
    registerBuildingVariant(2, MetaBeltBaseBuilding, DefaultBeltVariant, 1);
    registerBuildingVariant(3, MetaBeltBaseBuilding, DefaultBeltVariant, 2);

    // Splitter
    registerBuildingVariant(4, MetaSplitterBuilding, DefaultSplitterVariant);
    registerBuildingVariant(5, MetaSplitterBuilding, CompactSplitterVariant);
    registerBuildingVariant(6, MetaSplitterBuilding, CompactInverseSplitterVariant);
    registerBuildingVariant(47, MetaSplitterBuilding, CompactMergerVariant);
    registerBuildingVariant(48, MetaSplitterBuilding, CompactInverseMergerVariant);

    // Miner
    registerBuildingVariant(7, MetaMinerBuilding, DefaultMinerVariant);
    registerBuildingVariant(8, MetaMinerBuilding, ChainableMinerVariant);

    // Cutter
    registerBuildingVariant(9, MetaCutterBuilding, DefaultCutterVariant);
    registerBuildingVariant(10, MetaCutterBuilding, QuadCutterVariant);

    // Rotater
    registerBuildingVariant(11, MetaRotaterBuilding, DefaultRotaterVariant);
    registerBuildingVariant(12, MetaRotaterBuilding, CCWRotaterVariant);
    registerBuildingVariant(13, MetaRotaterBuilding, FLRotaterVariant);

    // Stacker
    registerBuildingVariant(14, MetaStackerBuilding, DefaultStackerVariant);

    // Mixer
    registerBuildingVariant(15, MetaMixerBuilding, DefaultMixerVariant);

    // Painter
    registerBuildingVariant(16, MetaPainterBuilding, DefaultPainterVariant);
    registerBuildingVariant(17, MetaPainterBuilding, MirroredPainterVariant);
    registerBuildingVariant(18, MetaPainterBuilding, DoublePainterVariant);
    registerBuildingVariant(19, MetaPainterBuilding, QuadPainterVariant);

    // Trash
    registerBuildingVariant(20, MetaTrashBuilding, DefaultTrashVariant);
    registerBuildingVariant(21, MetaTrashBuilding, StorageTrashVariant);

    // Underground belt
    registerBuildingVariant(22, MetaUndergroundBeltBuilding, DefaultUndergroundBeltVariant, 0);
    registerBuildingVariant(23, MetaUndergroundBeltBuilding, DefaultUndergroundBeltVariant, 1);
    registerBuildingVariant(24, MetaUndergroundBeltBuilding, Tier2UndergroundBeltVariant, 0);
    registerBuildingVariant(25, MetaUndergroundBeltBuilding, Tier2UndergroundBeltVariant, 1);

    // Hub
    registerBuildingVariant(26, MetaHubBuilding, DefaultHubVariant);

    // Wire
    registerBuildingVariant(27, MetaWireBuilding, DefaultWireVariant, 0);
    registerBuildingVariant(28, MetaWireBuilding, DefaultWireVariant, 1);
    registerBuildingVariant(29, MetaWireBuilding, DefaultWireVariant, 2);
    registerBuildingVariant(30, MetaWireBuilding, DefaultWireVariant, 3);

    // Constant signal
    registerBuildingVariant(31, MetaConstantSignalBuilding, DefaultConstantSignalVariant);

    // Logic gate
    registerBuildingVariant(32, MetaLogicGateBuilding, ANDGateVariant);
    registerBuildingVariant(34, MetaLogicGateBuilding, NOTGateVariant);
    registerBuildingVariant(35, MetaLogicGateBuilding, XORGateVariant);
    registerBuildingVariant(36, MetaLogicGateBuilding, ORGateVariant);
    registerBuildingVariant(38, MetaLogicGateBuilding, TransistorVariant);

    // Lever
    registerBuildingVariant(33, MetaLeverBuilding, DefaultLeverVariant);

    // Filter
    registerBuildingVariant(37, MetaFilterBuilding, DefaultFilterVariant);

    // Wire tunnel
    registerBuildingVariant(39, MetaWireTunnelBuilding, DefaultWireTunnelVariant);
    registerBuildingVariant(41, MetaWireTunnelBuilding, CoatedWireTunnelVariant);

    // Display
    registerBuildingVariant(40, MetaDisplayBuilding, DefaultDisplayVariant);

    // Virtual Processor
    registerBuildingVariant(42, MetaVirtualProcessorBuilding, CutterVirtualProcessorVariant);
    registerBuildingVariant(43, MetaVirtualProcessorBuilding, AnalyzerVirtualProcessorVariant);
    registerBuildingVariant(44, MetaVirtualProcessorBuilding, RotaterVirtualProcessorVariant);
    registerBuildingVariant(45, MetaVirtualProcessorBuilding, UnstackerVirtualProcessorVariant);
    registerBuildingVariant(46, MetaVirtualProcessorBuilding, ShapeCompareProcessorVariant);

    // Reader
    registerBuildingVariant(49, MetaReaderBuilding, DefaultReaderVariant);

    // Propagate instances
    for (const key in gBuildingVariants) {
        gBuildingVariants[key].metaInstance = gMetaBuildingRegistry.findByClass(
            gBuildingVariants[key].metaClass
        );
    }

    for (const key in gBuildingVariants) {
        const variant = gBuildingVariants[key];
        assert(variant.metaClass, "Variant has no meta: " + key);

        if (typeof variant.rotationVariant === "undefined") {
            variant.rotationVariant = 0;
        }
        /*if (typeof variant.variant === "undefined") {
            variant.variant = defaultBuildingVariant;
        }*/
    }

    logger.log("Registered", gMetaBuildingRegistry.getNumEntries(), "buildings");
    logger.log("Registered", Object.keys(gBuildingVariants).length, "building codes");
}

/**
 * Once all sprites are loaded, propagates the cache
 */
export function initBuildingCodesAfterResourcesLoaded() {
    logger.log("Propagating sprite cache");
    for (const key in gBuildingVariants) {
        const variant = gBuildingVariants[key];

        variant.sprite = variant.variant.getSprite(variant.rotationVariant, variant.metaInstance);
        variant.blueprintSprite = variant.variant.getBlueprintSprite(
            variant.rotationVariant,
            variant.metaInstance
        );
        variant.silhouetteColor = variant.metaInstance.getSilhouetteColor();
    }
}
