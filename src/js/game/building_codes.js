/* typehints:start */
import { MetaBuilding, MetaBuildingVariant } from "./meta_building";
import { AtlasSprite } from "../core/sprites";
import { Vector } from "../core/vector";
/* typehints:end */

/**
 * @typedef {{
 *   metaClass: typeof MetaBuilding,
 *   metaInstance?: MetaBuilding,
 *   variant: typeof MetaBuildingVariant,
 *   rotationVariant?: number,
 *   tileSize?: Vector,
 *   sprite?: AtlasSprite,
 *   blueprintSprite?: AtlasSprite,
 *   silhouetteColor?: string
 * }} BuildingVariantIdentifier
 */

/**
 * Stores a lookup table for all building variants (for better performance)
 * @type {Object<number, BuildingVariantIdentifier>}
 */
export const gBuildingVariants = {
    // Set later
};

/**
 * Mapping from 'metaBuildingId/variant/rotationVariant' to building code
 * @type {Map<string, string>}
 */
const variantsCache = new Map();

/**
 * Registers a new variant
 * @param {number | string} code
 * @param {typeof MetaBuilding} meta
 * @param {typeof MetaBuildingVariant} variant
 * @param {number} rotationVariant
 */
export function registerBuildingVariant(
    code,
    meta,
    variant,
    rotationVariant = 0
) {
    assert(!gBuildingVariants[code], "Duplicate id: " + code);
    gBuildingVariants[code.toString()] = {
        metaClass: meta,
        variant,
        rotationVariant,
        // @ts-ignore
        tileSize: variant.getDimensions(),
    };
}

/**
 *
 * @param {number | string} code
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
        const hash = data.metaInstance.getId() + "/" + data.variant + "/" + data.rotationVariant;
        variantsCache.set(hash, +code);
    }
}

/**
 * Finds the code for a given variant
 * @param {MetaBuilding} metaBuilding
 * @param {typeof MetaBuildingVariant} variant
 * @param {number} rotationVariant
 * @returns {string}
 */
export function getCodeFromBuildingData(metaBuilding, variant, rotationVariant) {
    const hash = metaBuilding.getId() + "/" + variant.getId() + "/" + rotationVariant;
    const result = variantsCache.get(hash);
    if (G_IS_DEV) {
        assertAlways(!!result, "Building not found by data: " + hash);
    }
    return result;
}
