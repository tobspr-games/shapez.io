import { gMetaBuildingRegistry } from "../core/global_registries";
import { createLogger } from "../core/logging";
import { MetaBeltBuilding } from "./buildings/belt";
import { MetaBeltBaseBuilding } from "./buildings/belt_base";
import { enumCutterVariants, MetaCutterBuilding } from "./buildings/cutter";
import { MetaHubBuilding } from "./buildings/hub";
import { enumMinerVariants, MetaMinerBuilding } from "./buildings/miner";
import { MetaMixerBuilding } from "./buildings/mixer";
import { enumPainterVariants, MetaPainterBuilding } from "./buildings/painter";
import { enumRotaterVariants, MetaRotaterBuilding } from "./buildings/rotater";
import { enumSplitterVariants, MetaSplitterBuilding } from "./buildings/splitter";
import { MetaStackerBuilding } from "./buildings/stacker";
import { enumTrashVariants, MetaTrashBuilding } from "./buildings/trash";
import { enumUndergroundBeltVariants, MetaUndergroundBeltBuilding } from "./buildings/underground_belt";
import { MetaWireBuilding } from "./buildings/wire";
import { gBuildingVariants, registerBuildingVariant } from "./building_codes";
import { defaultBuildingVariant } from "./meta_building";
import { MetaConstantSignalBuilding } from "./buildings/constant_signal";
import { MetaLogicGateBuilding, enumLogicGateVariants } from "./buildings/logic_gate";
import { MetaLeverBuilding } from "./buildings/lever";
import { MetaFilterBuilding } from "./buildings/filter";
import { MetaWireTunnelBuilding, enumWireTunnelVariants } from "./buildings/wire_tunnel";
import { MetaDisplayBuilding } from "./buildings/display";
import { MetaVirtualProcessorBuilding, enumVirtualProcessorVariants } from "./buildings/virtual_processor";

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

    // Belt
    registerBuildingVariant(1, MetaBeltBaseBuilding, defaultBuildingVariant, 0);
    registerBuildingVariant(2, MetaBeltBaseBuilding, defaultBuildingVariant, 1);
    registerBuildingVariant(3, MetaBeltBaseBuilding, defaultBuildingVariant, 2);

    // Splitter
    registerBuildingVariant(4, MetaSplitterBuilding);
    registerBuildingVariant(5, MetaSplitterBuilding, enumSplitterVariants.compact);
    registerBuildingVariant(6, MetaSplitterBuilding, enumSplitterVariants.compactInverse);

    // Miner
    registerBuildingVariant(7, MetaMinerBuilding);
    registerBuildingVariant(8, MetaMinerBuilding, enumMinerVariants.chainable);

    // Cutter
    registerBuildingVariant(9, MetaCutterBuilding);
    registerBuildingVariant(10, MetaCutterBuilding, enumCutterVariants.quad);

    // Rotater
    registerBuildingVariant(11, MetaRotaterBuilding);
    registerBuildingVariant(12, MetaRotaterBuilding, enumRotaterVariants.ccw);
    registerBuildingVariant(13, MetaRotaterBuilding, enumRotaterVariants.fl);

    // Stacker
    registerBuildingVariant(14, MetaStackerBuilding);

    // Mixer
    registerBuildingVariant(15, MetaMixerBuilding);

    // Painter
    registerBuildingVariant(16, MetaPainterBuilding);
    registerBuildingVariant(17, MetaPainterBuilding, enumPainterVariants.mirrored);
    registerBuildingVariant(18, MetaPainterBuilding, enumPainterVariants.double);
    registerBuildingVariant(19, MetaPainterBuilding, enumPainterVariants.quad);

    // Trash
    registerBuildingVariant(20, MetaTrashBuilding);
    registerBuildingVariant(21, MetaTrashBuilding, enumTrashVariants.storage);

    // Underground belt
    registerBuildingVariant(22, MetaUndergroundBeltBuilding, defaultBuildingVariant, 0);
    registerBuildingVariant(23, MetaUndergroundBeltBuilding, defaultBuildingVariant, 1);
    registerBuildingVariant(24, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2, 0);
    registerBuildingVariant(25, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2, 1);

    // Hub
    registerBuildingVariant(26, MetaHubBuilding);

    // Wire
    registerBuildingVariant(27, MetaWireBuilding, defaultBuildingVariant, 0);
    registerBuildingVariant(28, MetaWireBuilding, defaultBuildingVariant, 1);
    registerBuildingVariant(29, MetaWireBuilding, defaultBuildingVariant, 2);
    registerBuildingVariant(30, MetaWireBuilding, defaultBuildingVariant, 3);

    // Constant signal
    registerBuildingVariant(31, MetaConstantSignalBuilding);

    // Logic gate
    registerBuildingVariant(32, MetaLogicGateBuilding);
    registerBuildingVariant(34, MetaLogicGateBuilding, enumLogicGateVariants.not);
    registerBuildingVariant(35, MetaLogicGateBuilding, enumLogicGateVariants.xor);
    registerBuildingVariant(36, MetaLogicGateBuilding, enumLogicGateVariants.or);
    registerBuildingVariant(38, MetaLogicGateBuilding, enumLogicGateVariants.transistor);

    // Lever
    registerBuildingVariant(33, MetaLeverBuilding);

    // Filter
    registerBuildingVariant(37, MetaFilterBuilding);

    // Wire tunnel
    registerBuildingVariant(39, MetaWireTunnelBuilding);
    registerBuildingVariant(41, MetaWireTunnelBuilding, enumWireTunnelVariants.coating);

    // Display
    registerBuildingVariant(40, MetaDisplayBuilding);

    // Virtual Processor
    registerBuildingVariant(42, MetaVirtualProcessorBuilding);
    registerBuildingVariant(43, MetaVirtualProcessorBuilding, enumVirtualProcessorVariants.analyzer);
    registerBuildingVariant(44, MetaVirtualProcessorBuilding, enumVirtualProcessorVariants.rotater);
    registerBuildingVariant(45, MetaVirtualProcessorBuilding, enumVirtualProcessorVariants.unstacker);
    registerBuildingVariant(46, MetaVirtualProcessorBuilding, enumVirtualProcessorVariants.shapecompare);

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
        if (typeof variant.variant === "undefined") {
            variant.variant = defaultBuildingVariant;
        }
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

        variant.sprite = variant.metaInstance.getSprite(variant.rotationVariant, variant.variant);
        variant.blueprintSprite = variant.metaInstance.getBlueprintSprite(
            variant.rotationVariant,
            variant.variant
        );
        variant.silhouetteColor = variant.metaInstance.getSilhouetteColor();
    }
}
