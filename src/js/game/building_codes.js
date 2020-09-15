/* typehints:start */
import { MetaBuilding } from "./meta_building";
import { AtlasSprite } from "../core/sprites";
import { Vector } from "../core/vector";
/* typehints:end */

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
 * @type {Object<number, BuildingVariantIdentifier>}
 */
export const gBuildingVariants = {
    // Set later
};

/**
 * Registers a new variant
 * @param {number} id
 * @param {typeof MetaBuilding} meta
 * @param {string} variant
 * @param {number} rotationVariant
 */
export function registerBuildingVariant(
    id,
    meta,
    variant = "default" /* FIXME: Circular dependency, actually its defaultBuildingVariant */,
    rotationVariant = 0
) {
    assert(!gBuildingVariants[id], "Duplicate id: " + id);
    gBuildingVariants[id] = {
        metaClass: meta,
        variant,
        rotationVariant,
        // @ts-ignore
        tileSize: new meta().getDimensions(variant),
    };
}

/**
 *
 * @param {number} code
 * @returns {BuildingVariantIdentifier}
 */
export function getBuildingDataFromCode(code) {
    assert(gBuildingVariants[code], "Invalid building code: " + code);
    return gBuildingVariants[code];
}

/**
 * Finds the code for a given variant
 * @param {MetaBuilding} metaBuilding
 * @param {string} variant
 * @param {number} rotationVariant
 */
export function getCodeFromBuildingData(metaBuilding, variant, rotationVariant) {
    for (const key in gBuildingVariants) {
        const data = gBuildingVariants[key];
        if (
            data.metaInstance.getId() === metaBuilding.getId() &&
            data.variant === variant &&
            data.rotationVariant === rotationVariant
        ) {
            return +key;
        }
    }
    assertAlways(
        false,
        "Building not found by data: " + metaBuilding.getId() + " / " + variant + " / " + rotationVariant
    );
    return 0;
}
