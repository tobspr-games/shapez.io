import { gMetaBuildingRegistry } from "../core/global_registries";
import { createLogger } from "../core/logging";
import { MetaAdvancedProcessorBuilding } from "./buildings/advanced_processor";
import { MetaBeltBuilding } from "./buildings/belt";
import { MetaBeltBaseBuilding } from "./buildings/belt_base";
import { enumCutterVariants, MetaCutterBuilding } from "./buildings/cutter";
import { MetaEnergyGenerator } from "./buildings/energy_generator";
import { MetaHubBuilding } from "./buildings/hub";
import { enumMinerVariants, MetaMinerBuilding } from "./buildings/miner";
import { MetaMixerBuilding } from "./buildings/mixer";
import { enumPainterVariants, MetaPainterBuilding } from "./buildings/painter";
import { enumRotaterVariants, MetaRotaterBuilding } from "./buildings/rotater";
import { enumSplitterVariants, MetaSplitterBuilding } from "./buildings/splitter";
import { MetaStackerBuilding } from "./buildings/stacker";
import { enumTrashVariants, MetaTrashBuilding } from "./buildings/trash";
import { enumUndergroundBeltVariants, MetaUndergroundBeltBuilding } from "./buildings/underground_belt";
import { MetaWireBaseBuilding } from "./buildings/wire_base";
import { enumWireCrossingVariants, MetaWireCrossingsBuilding } from "./buildings/wire_crossings";
import { gBuildingVariants, registerBuildingVariant } from "./building_codes";
import { defaultBuildingVariant } from "./meta_building";

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
    gMetaBuildingRegistry.register(MetaEnergyGenerator);
    gMetaBuildingRegistry.register(MetaWireBaseBuilding);
    gMetaBuildingRegistry.register(MetaAdvancedProcessorBuilding);
    gMetaBuildingRegistry.register(MetaWireCrossingsBuilding);

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
    registerBuildingVariant(24, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.side, 0);
    registerBuildingVariant(25, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.side, 1);
    registerBuildingVariant(26, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.sideMirrored, 0);
    registerBuildingVariant(27, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.sideMirrored, 1);
    registerBuildingVariant(28, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2, 0);
    registerBuildingVariant(29, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2, 1);
    registerBuildingVariant(30, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2Side, 0);
    registerBuildingVariant(31, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2Side, 1);
    registerBuildingVariant(32, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2SideMirrored, 0);
    registerBuildingVariant(33, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2SideMirrored, 1);

    // Hub
    registerBuildingVariant(34, MetaHubBuilding);

    // Energy generator
    registerBuildingVariant(35, MetaEnergyGenerator);

    // Wire
    registerBuildingVariant(36, MetaWireBaseBuilding, defaultBuildingVariant, 0);
    registerBuildingVariant(37, MetaWireBaseBuilding, defaultBuildingVariant, 1);
    registerBuildingVariant(38, MetaWireBaseBuilding, defaultBuildingVariant, 2);

    // Advanced processor
    registerBuildingVariant(39, MetaAdvancedProcessorBuilding);

    // Wire crossing
    registerBuildingVariant(40, MetaWireCrossingsBuilding);
    registerBuildingVariant(41, MetaWireCrossingsBuilding, enumWireCrossingVariants.merger);

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
