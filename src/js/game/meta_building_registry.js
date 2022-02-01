import { gMetaBuildingRegistry } from "../core/global_registries";
import { createLogger } from "../core/logging";
import { T } from "../translations";
import { MetaAnalyzerBuilding } from "./buildings/analyzer";
import { MetaBalancerBuilding } from "./buildings/balancer";
import { MetaBeltBuilding } from "./buildings/belt";
import { MetaBlockBuilding } from "./buildings/block";
import { MetaComparatorBuilding } from "./buildings/comparator";
import { MetaConstantProducerBuilding } from "./buildings/constant_producer";
import { MetaConstantSignalBuilding } from "./buildings/constant_signal";
import { MetaCutterBuilding } from "./buildings/cutter";
import { MetaDisplayBuilding } from "./buildings/display";
import { MetaFilterBuilding } from "./buildings/filter";
import { MetaGoalAcceptorBuilding } from "./buildings/goal_acceptor";
import { MetaHubBuilding } from "./buildings/hub";
import { MetaItemProducerBuilding } from "./buildings/item_producer";
import { MetaLeverBuilding } from "./buildings/lever";
import { MetaLogicGateBuilding } from "./buildings/logic_gate";
import { MetaMinerBuilding } from "./buildings/miner";
import { MetaMixerBuilding } from "./buildings/mixer";
import { MetaPainterBuilding } from "./buildings/painter";
import { MetaReaderBuilding } from "./buildings/reader";
import { MetaRotaterBuilding } from "./buildings/rotater";
import { MetaStackerBuilding } from "./buildings/stacker";
import { MetaStorageBuilding } from "./buildings/storage";
import { MetaTransistorBuilding } from "./buildings/transistor";
import { MetaTrashBuilding } from "./buildings/trash";
import { MetaUndergroundBeltBuilding } from "./buildings/underground_belt";
import { MetaVirtualProcessorBuilding } from "./buildings/virtual_processor";
import { MetaWireBuilding } from "./buildings/wire";
import { MetaWireTunnelBuilding } from "./buildings/wire_tunnel";
import { buildBuildingCodeCache, gBuildingVariants, registerBuildingVariant } from "./building_codes";
import { KEYMAPPINGS } from "./key_action_mapper";
import { defaultBuildingVariant, MetaBuilding } from "./meta_building";

const logger = createLogger("building_registry");

/**
 *
 * @param {typeof MetaBuilding} metaBuilding
 */
export function registerBuildingVariants(metaBuilding) {
    gMetaBuildingRegistry.register(metaBuilding);
    const combinations = metaBuilding.getAllVariantCombinations();
    combinations.forEach(combination => {
        registerBuildingVariant(
            combination.internalId,
            metaBuilding,
            combination.variant || defaultBuildingVariant,
            combination.rotationVariant || 0
        );
    });
}

export function initMetaBuildingRegistry() {
    const buildings = [
        MetaBalancerBuilding,
        MetaMinerBuilding,
        MetaCutterBuilding,
        MetaRotaterBuilding,
        MetaStackerBuilding,
        MetaMixerBuilding,
        MetaPainterBuilding,
        MetaTrashBuilding,
        MetaStorageBuilding,
        MetaBeltBuilding,
        MetaUndergroundBeltBuilding,
        MetaGoalAcceptorBuilding,
        MetaHubBuilding,
        MetaWireBuilding,
        MetaConstantSignalBuilding,
        MetaLogicGateBuilding,
        MetaLeverBuilding,
        MetaFilterBuilding,
        MetaWireTunnelBuilding,
        MetaDisplayBuilding,
        MetaVirtualProcessorBuilding,
        MetaReaderBuilding,
        MetaTransistorBuilding,
        MetaAnalyzerBuilding,
        MetaComparatorBuilding,
        MetaItemProducerBuilding,
        MetaConstantProducerBuilding,
        MetaBlockBuilding,
    ];

    buildings.forEach(registerBuildingVariants);

    // Check for valid keycodes
    if (G_IS_DEV) {
        gMetaBuildingRegistry.entries.forEach(metaBuilding => {
            const id = metaBuilding.getId();
            if (!["hub"].includes(id)) {
                if (!KEYMAPPINGS.buildings[id]) {
                    console.error(
                        "Building " + id + " has no keybinding assigned! Add it to key_action_mapper.js"
                    );
                }

                if (!T.buildings[id]) {
                    console.error("Translation for building " + id + " missing!");
                } else if (!T.buildings[id].default) {
                    console.error("Translation for building " + id + " missing (default variant)!");
                }
            }
        });
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
        variant.silhouetteColor = variant.metaInstance.getSilhouetteColor(
            variant.variant,
            variant.rotationVariant
        );
    }

    // Update caches
    buildBuildingCodeCache();
}
