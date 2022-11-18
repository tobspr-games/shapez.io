/* typehints:start */
import type { MetaBuilding } from "./meta_building";
import type { AtlasSprite } from "../core/sprites";
import type { Vector } from "../core/vector";
/* typehints:end */
import { gMetaBuildingRegistry } from "../core/global_registries";
export type BuildingVariantIdentifier = {
    metaClass: typeof MetaBuilding;
    metaInstance?: MetaBuilding;
    variant?: string;
    rotationVariant?: number;
    tileSize?: Vector;
    sprite?: AtlasSprite;
    blueprintSprite?: AtlasSprite;
    silhouetteColor?: string;
};

/**
 * Stores a lookup table for all building variants (for better performance)
 */
export const gBuildingVariants: {
    [idx: number|string]: BuildingVariantIdentifier;
} = {
// Set later
};
/**
 * Mapping from 'metaBuildingId/variant/rotationVariant' to building code
 */
const variantsCache: Map<string, number | string> = new Map();
/**
 * Registers a new variant
 */
export function registerBuildingVariant(code: number | string, meta: typeof MetaBuilding, variant: string = "default" /* @TODO: Circular dependency, actually its defaultBuildingVariant */, rotationVariant: number = 0) {
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
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * @param {} buildingId
 * @param {} variant
 * @param {} rotat * @
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * @param {string} buildingId
 * @param {string} variant
 * @param {number} rotat * @returns
 */
functioildingHash(build striniant: strin
/**

/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * @param {} buildingId
 * @param {} variant
 * @param {} rotationVar * @
/**

/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * @param {string} buildingId
 * @param {string} variant
 * @param {number} rotationVar * @returns
 */
functiorateBuildingHash(build string, variant: strin
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * @param {} buildingId
 * @param {} variant
 * @param {} rotationVar * @
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * @param {string} buildingId
 * @param {string} variant
 * @param {number} rotationVar * @returns
 */
functiorateBuildingHash(build string, variant: strin
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * @param {} buildingId
 * @param {} variant
 * @param {} rotationVariant
 * @
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * 
/**
 * Hashes the combination of buildng, variant and rotation variant
 * @param {string} buildingId
 * @param {string} variant
 * @param {number} rotationVariant
 * @returns
 */
function generateBuildingHash(buildingId: string, variant: string, rotationVariant: number) {
    return buildingId + "/" + variant + "/" + rotationVariant;
}
/**
 *
 * {}
 */
export function getBuildingDataFromCode(code: string | number): BuildingVariantIdentifier {
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
 * {}
 */
export function getCodeFromBuildingData(metaBuilding: MetaBuilding, variant: string, rotationVariant: number): number | string {
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
