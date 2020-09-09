import { MetaBuilding, defaultBuildingVariant } from "../game/meta_building";
import { AtlasSprite, SpriteAtlasLink } from "../core/sprites";
import { atlasFiles } from "../core/atlas_definitions";
import { getFileAsDataURI } from "./mod_utils";
import { Loader } from "../core/loader";

/**
 * @typedef {{
 * url: string,
 * width: number,
 * height: number
 * }} ExternalSpriteMeta
 */

/**
 * @typedef {{
 * normal: ExternalSpriteMeta
 * blueprint: ExternalSpriteMeta
 * }} SpriteTypesMetas
 */

/**
 * @typedef {{
 * default: Array<SpriteTypesMetas>
 * [variant: string]: Array<SpriteTypesMetas>
 * }} BuildingSpriteMetas
 */

/**
 * @typedef {{
 * name: string,
 * description: string
 * }} BuildingVariantTranslation
 */

/**
 * @typedef {{
 * variants: {[variant: string]: BuildingVariantTranslation, default: BuildingVariantTranslation},
 * keybinding: string
 * }} BuildingTranlsations
 */

export class MetaModBuilding extends MetaBuilding {
    /**
     * Returns the building IDs
     * @returns {String}
     */
    static getId() {
        abstract;
        return "";
    }

    /**
     * Returns the building variants IDs
     * @returns {Array<String>}
     */
    static getVariants() {
        return [];
    }

    /**
     * Returns the building keybinding
     * @returns {String | number}
     */
    static getKeybinding() {
        abstract;
        return "";
    }

    /**
     * Returns the building translations
     * @returns {BuildingTranlsations}
     */
    static getTranslations() {
        abstract;
        return { variants: { default: { name: "", description: "" } }, keybinding: "" };
    }

    /**
     * @param {string} id
     */
    constructor(id) {
        super(id);

        /** @type {Object<string, AtlasSprite>} */
        this.cachedSprites = {};
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {keyof BuildingSpriteMetas} type
     * @returns {AtlasSprite}
     */
    getSprite(rotationVariant, variant, type = "normal") {
        const sprite_id =
            this.id +
            (variant === defaultBuildingVariant ? "" : "-" + variant) +
            "-" +
            rotationVariant +
            "-" +
            type;

        if (this.cachedSprites[sprite_id]) {
            return this.cachedSprites[sprite_id];
        }

        const sprite = new AtlasSprite(sprite_id);
        this.cachedSprites[sprite_id] = sprite;

        const meta = this.getSpriteMetas()[variant][rotationVariant][type];
        const scales = atlasFiles.map(af => af.meta.scale);
        for (const res of scales) {
            sprite.linksByResolution[res] = Loader.spriteNotFoundSprite.linksByResolution[res];
        }

        getFileAsDataURI(meta.url).then(data => {
            const img = document.createElement("img");
            img.src = data;

            const link = new SpriteAtlasLink({
                atlas: img,
                packOffsetX: 0,
                packOffsetY: 0,
                packedX: 0,
                packedY: 0,
                packedW: meta.width,
                packedH: meta.height,
                w: meta.width,
                h: meta.width,
            });
            for (const res of scales) {
                sprite.linksByResolution[res] = link;
            }
        });

        return sprite;
    }

    getBlueprintSprite(rotationVariant = 0, variant = defaultBuildingVariant) {
        return this.getSprite(rotationVariant, variant, "blueprint");
    }

    getPreviewSprite(rotationVariant = 0, variant = defaultBuildingVariant) {
        return this.getSprite(rotationVariant, variant);
    }

    /**
     * Returns the sprite metadata for a given variant
     * @returns {BuildingSpriteMetas}
     */
    getSpriteMetas() {
        abstract;
        return null;
    }
}
