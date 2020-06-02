/* typehints:start */
import { Application } from "../application";
/* typehints:end */

import { AtlasDefinition } from "./atlas_definitions";
import { makeOffscreenBuffer } from "./buffer_utils";
import { AtlasSprite, BaseSprite, RegularSprite, SpriteAtlasLink } from "./sprites";
import { cachebust } from "./cachebust";
import { createLogger } from "./logging";
import { globalConfig } from "../core/config";

const logger = createLogger("loader");

const missingSpriteIds = {};

class LoaderImpl {
    constructor() {
        /** @type {Application} */
        this.app = null;

        /** @type {Map<string, BaseSprite>} */
        this.sprites = new Map();

        this.rawImages = [];
    }

    linkAppAfterBoot(app) {
        this.app = app;
        this.makeSpriteNotFoundCanvas();
    }

    /**
     * Fetches a given sprite from the cache
     * @param {string} key
     * @returns {BaseSprite}
     */
    getSpriteInternal(key) {
        const sprite = this.sprites.get(key);
        if (!sprite) {
            if (!missingSpriteIds[key]) {
                // Only show error once
                missingSpriteIds[key] = true;
                logger.error("Sprite '" + key + "' not found!");
            }
            return this.spriteNotFoundSprite;
        }
        return sprite;
    }

    /**
     * Returns an atlas sprite from the cache
     * @param {string} key
     * @returns {AtlasSprite}
     */
    getSprite(key) {
        const sprite = this.getSpriteInternal(key);
        assert(sprite instanceof AtlasSprite || sprite === this.spriteNotFoundSprite, "Not an atlas sprite");
        return /** @type {AtlasSprite} */ (sprite);
    }

    /**
     * Retursn a regular sprite from the cache
     * @param {string} key
     * @returns {RegularSprite}
     */
    getRegularSprite(key) {
        const sprite = this.getSpriteInternal(key);
        assert(
            sprite instanceof RegularSprite || sprite === this.spriteNotFoundSprite,
            "Not a regular sprite"
        );
        return /** @type {RegularSprite} */ (sprite);
    }

    /**
     *
     * @param {string} key
     * @returns {Promise<HTMLImageElement|null>}
     */
    internalPreloadImage(key) {
        const url = cachebust("res/" + key);
        const image = new Image();

        let triesSoFar = 0;

        return Promise.race([
            new Promise((resolve, reject) => {
                setTimeout(reject, G_IS_DEV && !globalConfig.debug.waitForImages ? 500 : 10000);
            }),

            new Promise(resolve => {
                image.onload = () => {
                    image.onerror = null;
                    image.onload = null;

                    if (typeof image.decode === "function") {
                        // SAFARI: Image.decode() fails on safari with svgs -> we dont want to fail
                        // on that
                        // FIREFOX: Decode never returns if the image is in cache, so call it in background
                        image.decode().then(
                            () => null,
                            () => null
                        );
                    }
                    resolve(image);
                };

                image.onerror = reason => {
                    logger.warn("Failed to load '" + url + "':", reason);
                    if (++triesSoFar < 4) {
                        logger.log("Retrying to load image from", url);
                        image.src = url + "?try=" + triesSoFar;
                    } else {
                        logger.warn("Failed to load", url, "after", triesSoFar, "tries with reason", reason);
                        image.onerror = null;
                        image.onload = null;
                        resolve(null);
                    }
                };

                image.src = url;
            }),
        ]);
    }

    /**
     * Preloads a sprite
     * @param {string} key
     * @returns {Promise<void>}
     */
    preloadCSSSprite(key) {
        return this.internalPreloadImage(key).then(image => {
            if (key.indexOf("game_misc") >= 0) {
                // Allow access to regular sprites
                this.sprites.set(key, new RegularSprite(image, image.width, image.height));
            }
            this.rawImages.push(image);
        });
    }

    /**
     * Preloads an atlas
     * @param {AtlasDefinition} atlas
     * @returns {Promise<void>}
     */
    preloadAtlas(atlas) {
        return this.internalPreloadImage(atlas.getFullSourcePath()).then(image => {
            // @ts-ignore
            image.label = atlas.sourceFileName;
            return this.internalParseAtlas(atlas, image);
        });
    }

    /**
     *
     * @param {AtlasDefinition} atlas
     * @param {HTMLImageElement} loadedImage
     */
    internalParseAtlas(atlas, loadedImage) {
        this.rawImages.push(loadedImage);

        for (const spriteKey in atlas.sourceData) {
            const spriteData = atlas.sourceData[spriteKey];

            let sprite = /** @type {AtlasSprite} */ (this.sprites.get(spriteKey));

            if (!sprite) {
                sprite = new AtlasSprite({
                    spriteName: spriteKey,
                });
                this.sprites.set(spriteKey, sprite);
            }

            const link = new SpriteAtlasLink({
                packedX: spriteData.frame.x,
                packedY: spriteData.frame.y,
                packedW: spriteData.frame.w,
                packedH: spriteData.frame.h,
                packOffsetX: spriteData.spriteSourceSize.x,
                packOffsetY: spriteData.spriteSourceSize.y,
                atlas: loadedImage,
                w: spriteData.sourceSize.w,
                h: spriteData.sourceSize.h,
            });
            sprite.linksByResolution[atlas.meta.scale] = link;
        }
    }

    /**
     * Creates the links for the sprites after the atlas has been loaded. Used so we
     * don't have to store duplicate sprites.
     */
    createAtlasLinks() {
        // NOT USED
    }

    /**
     * Makes the canvas which shows the question mark, shown when a sprite was not found
     */
    makeSpriteNotFoundCanvas() {
        const dims = 128;

        const [canvas, context] = makeOffscreenBuffer(dims, dims, {
            smooth: false,
            label: "not-found-sprite",
        });
        context.fillStyle = "#f77";
        context.fillRect(0, 0, dims, dims);

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#eee";
        context.font = "25px Arial";
        context.fillText("???", dims / 2, dims / 2);

        // TODO: Not sure why this is set here
        // @ts-ignore
        canvas.src = "not-found";

        const resolutions = ["0.1", "0.25", "0.5", "0.75", "1"];
        const sprite = new AtlasSprite({
            spriteName: "not-found",
        });

        for (let i = 0; i < resolutions.length; ++i) {
            const res = resolutions[i];
            const link = new SpriteAtlasLink({
                packedX: 0,
                packedY: 0,
                w: dims,
                h: dims,
                packOffsetX: 0,
                packOffsetY: 0,
                packedW: dims,
                packedH: dims,
                atlas: canvas,
            });
            sprite.linksByResolution[res] = link;
        }
        this.spriteNotFoundSprite = sprite;
    }
}

export const Loader = new LoaderImpl();
