/* typehints:start */
import { Application } from "../application";
import { ModLoader } from "./modloader";
/* typehints:end */

import { createLogger } from "../core/logging";
import { AtlasSprite, SpriteAtlasLink } from "../core/sprites";
import { Mod } from "./mod";
import { enumShortcodeToSubShape, enumSubShape, enumSubShapeToShortcode } from "../game/shape_definition";
import { Loader } from "../core/loader";
import { LANGUAGES } from "../languages";
import { matchDataRecursive, T } from "../translations";

const LOG = createLogger("mod-interface");

/**
 * @type {Object<string, (distanceToOriginInChunks: number) => number>}
 */
export const MODS_ADDITIONAL_SHAPE_MAP_WEIGHTS = {};

/**
 * @typedef {{
 *   context: CanvasRenderingContext2D,
 *   quadrantSize: number,
 *   layerScale: number,
 * }} SubShapeDrawOptions
 */

/**
 * @type {Object<string, (options: SubShapeDrawOptions) => void>}
 */
export const MODS_ADDITIONAL_SUB_SHAPE_DRAWERS = {};

export class ModInterface {
    /**
     *
     * @param {ModLoader} modLoader
     */
    constructor(modLoader) {
        this.modLoader = modLoader;

        /** @type {Map<string, AtlasSprite>} */
        this.lazySprites = new Map();
    }

    registerCss(cssString) {
        const element = document.createElement("style");
        element.textContent = cssString;
        document.head.appendChild(element);
    }

    registerSprite(spriteId, base64string) {
        assert(base64string.startsWith("data:image"));
        const img = new Image();
        img.src = base64string;

        const sprite = new AtlasSprite(spriteId);

        const link = new SpriteAtlasLink({
            w: img.width,
            h: img.height,
            atlas: img,
            packOffsetX: 0,
            packOffsetY: 0,
            packedW: img.width,
            packedH: img.height,
            packedX: 0,
            packedY: 0,
        });

        sprite.linksByResolution["0.25"] = link;
        sprite.linksByResolution["0.5"] = link;
        sprite.linksByResolution["0.75"] = link;

        this.lazySprites.set(spriteId, sprite);
    }

    injectSprites() {
        LOG.log("inject sprites");
        this.lazySprites.forEach((sprite, key) => {
            Loader.sprites.set(key, sprite);
            console.log("override", key);
        });
    }

    /**
     *
     * @param {object} param0
     * @param {string} param0.id
     * @param {string} param0.shortCode
     * @param {(distanceToOriginInChunks: number) => number} param0.weightComputation
     * @param {(options: SubShapeDrawOptions) => void} param0.shapeDrawer
     */
    registerSubShapeType({ id, shortCode, weightComputation, shapeDrawer }) {
        if (shortCode.length !== 1) {
            throw new Error("Bad short code: " + shortCode);
        }
        enumSubShape[id] = id;
        enumSubShapeToShortcode[id] = shortCode;
        enumShortcodeToSubShape[shortCode] = id;

        MODS_ADDITIONAL_SHAPE_MAP_WEIGHTS[id] = weightComputation;
        MODS_ADDITIONAL_SUB_SHAPE_DRAWERS[id] = shapeDrawer;
    }

    registerTranslations(language, translations) {
        const data = LANGUAGES[language];
        if (!data) {
            throw new Error("Unknown language: " + language);
        }

        matchDataRecursive(data.data, translations, true);
        if (language === "en") {
            matchDataRecursive(T, translations, true);
        }
    }
}
