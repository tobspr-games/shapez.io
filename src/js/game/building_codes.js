/* typehints:start */
import { MetaBuilding } from "./meta_building";
import { AtlasSprite } from "../core/sprites";
import { Vector } from "../core/vector";
/* typehints:end */

import { gMetaBuildingRegistry } from "../core/global_registries";

/**
 * @typedef {{
 *   metaClass: typeof MetaBuilding,
 *   metaInstance?: MetaBuilding,
 *   variant?: string,
 *   rotationVariant?: number,
 *   tileSize?: Vector,
 *   sprite?: AtlasSprite,
 *   blueprintSprite?: AtlasSprite,
 *   silhouetteColor?: string
 * }} BuildingVariantIdentifier
 */

/**
 * Stores a lookup table for all building variants (for better performance)
 * @type {Object<number|string, BuildingVariantIdentifier>}
 */
export const gBuildingVariants = {
    // Set later
};

/**
 * Mapping from 'metaBuildingId/variant/rotationVariant' to building code
 * @type {Map<string, number|string>}
 */
const variantsCache = new Map();

/**
 * Registers a new variant
 * @param {number|string} code
 * @param {typeof MetaBuilding} meta
 * @param {string} variant
 * @param {number} rotationVariant
 */
export function registerBuildingVariant(
    code,
    meta,
    variant = "default" /* @TODO: Circular dependency, actually its defaultBuildingVariant */,
    rotationVariant = 0
) {
    assert(!gBuildingVariants[code], "Duplicate id: " + code);
    gBuildingVariants[code] = {
        metaClass: meta,
        metaInstance: gMetaBuildingRegistry.findByClass(meta),
        variant,
        rotationVariant,
        // @ts-ignore
        tileSize: new meta().getDimensions(variant),
    };
}

/**
 * Hashes the combination of buildng, variant and rotation variant
 * @param {string} buildingId
 * @param {string} variant
 * @param {number} rotationVariant
 * @returns
 */
function generateBuildingHash(buildingId, variant, rotationVariant) {
    return buildingId + "/" + variant + "/" + rotationVariant;
}

/**
 *
 * @param {string|number} code
 * @returns {BuildingVariantIdentifier}
 */
export function getBuildingDataFromCode(code) {
    assert(gBuildingVariants[code], "Invalid building code: " + code);
    return gBuildingVariants[code];
}

/**
 * Builds the cache for the codes
 */
export function buildBuildingCodeCache() {
    for (const code in gBuildingVariants) {
        const data = gBuildingVariants[code];
        const hash = generateBuildingHash(data.metaInstance.getId(), data.variant, data.rotationVariant);
        variantsCache.set(hash, isNaN(+code) ? code : +code);
    }
}

/**
 * Finds the code for a given variant
 * @param {MetaBuilding} metaBuilding
 * @param {string} variant
 * @param {number} rotationVariant
 * @returns {number|string}
 */
export function getCodeFromBuildingData(metaBuilding, variant, rotationVariant) {
    const hash = generateBuildingHash(metaBuilding.getId(), variant, rotationVariant);
    const result = variantsCache.get(hash);
    if (G_IS_DEV) {
        if (!result) {
            console.warn("Known hashes:", Array.from(variantsCache.keys()));
            assertAlways(false, "Building not found by data: " + hash);
        }
    }
    return result;
}
