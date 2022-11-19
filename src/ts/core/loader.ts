import { makeOffscreenBuffer } from "./buffer_utils";
import { AtlasSprite, BaseSprite, RegularSprite, SpriteAtlasLink } from "./sprites";
import { cachebust } from "./cachebust";
import { createLogger } from "./logging";

import type { Application } from "../application";
import type { AtlasDefinition } from "./atlas_definitions";

const logger = createLogger("loader");

const missingSpriteIds = {};

class LoaderImpl {
    public app = null;
    public sprites: Map<string, BaseSprite> = new Map();
    public rawImages = [];
    public spriteNotFoundSprite: AtlasSprite;

    linkAppAfterBoot(app: Application) {
        this.app = app;
        this.makeSpriteNotFoundCanvas();
    }

    /**
     * Fetches a given sprite from the cache
     */
    getSpriteInternal(key: string): BaseSprite {
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
     */
    getSprite(key: string): AtlasSprite {
        const sprite = this.getSpriteInternal(key);
        assert(sprite instanceof AtlasSprite || sprite === this.spriteNotFoundSprite, "Not an atlas sprite");
        return sprite as AtlasSprite;
    }

    /**
     * Returns a regular sprite from the cache
     */
    getRegularSprite(key: string): RegularSprite {
        const sprite = this.getSpriteInternal(key);
        assert(
            sprite instanceof RegularSprite || sprite === this.spriteNotFoundSprite,
            "Not a regular sprite"
        );
        return sprite as RegularSprite;
    }

    /**
     *
     */
    internalPreloadImage(
        key: string,
        progressHandler: (progress: number) => void
    ): Promise<HTMLImageElement | null> {
        return this.app.backgroundResourceLoader
            .preloadWithProgress("res/" + key, progress => {
                progressHandler(progress);
            })
            .then(url => {
                return new Promise((resolve, reject) => {
                    const image = new Image();
                    image.addEventListener("load", () => resolve(image));
                    image.addEventListener("error", err =>
                        reject("Failed to load sprite " + key + ": " + err)
                    );
                    image.src = url;
                });
            });
    }

    /**
     * Preloads a sprite
     */
    preloadCSSSprite(key: string, progressHandler: (progress: number) => void): Promise<void> {
        return this.internalPreloadImage(key, progressHandler).then(image => {
            if (key.indexOf("game_misc") >= 0) {
                // Allow access to regular sprites
                this.sprites.set(key, new RegularSprite(image, image.width, image.height));
            }
            this.rawImages.push(image);
        });
    }

    /**
     * Preloads an atlas
     */
    preloadAtlas(atlas: AtlasDefinition, progressHandler: (progress: number) => void): Promise<void> {
        return this.internalPreloadImage(atlas.getFullSourcePath(), progressHandler).then(image => {
            // @ts-ignore
            image.label = atlas.sourceFileName;
            return this.internalParseAtlas(atlas, image);
        });
    }

    internalParseAtlas({ meta: { scale }, sourceData }: AtlasDefinition, loadedImage: HTMLImageElement) {
        this.rawImages.push(loadedImage);

        for (const spriteName in sourceData) {
            const { frame, sourceSize, spriteSourceSize } = sourceData[spriteName];

            let sprite = this.sprites.get(spriteName) as AtlasSprite;

            if (!sprite) {
                sprite = new AtlasSprite(spriteName);
                this.sprites.set(spriteName, sprite);
            }
            if (sprite.frozen) {
                continue;
            }

            const link = new SpriteAtlasLink({
                packedX: frame.x,
                packedY: frame.y,
                packedW: frame.w,
                packedH: frame.h,
                packOffsetX: spriteSourceSize.x,
                packOffsetY: spriteSourceSize.y,
                atlas: loadedImage,
                w: sourceSize.w,
                h: sourceSize.h,
            });

            sprite.linksByResolution[scale] = link;
        }
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
        const sprite = new AtlasSprite("not-found");
        ["0.1", "0.25", "0.5", "0.75", "1"].forEach(resolution => {
            sprite.linksByResolution[resolution] = new SpriteAtlasLink({
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
        });
        this.spriteNotFoundSprite = sprite;
    }
}

export const Loader = new LoaderImpl();
