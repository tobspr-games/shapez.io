/* typehints:start */
import { Application } from "../application";
import { ModLoader } from "./modloader";
/* typehints:end */

import { createLogger } from "../core/logging";
import { AtlasSprite, SpriteAtlasLink } from "../core/sprites";
import { Mod } from "./mod";
import { enumShortcodeToSubShape, enumSubShape, enumSubShapeToShortcode } from "../game/shape_definition";

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
     * @param {Mod} mod
     */
    constructor(modLoader, mod) {
        /**
         * @param {Application} app
         */
        this.app = undefined;

        this.modLoader = modLoader;
        this.mod = mod;
    }

    registerCss(cssString) {
        const element = document.createElement("style");
        element.textContent = cssString;
        element.setAttribute("data-mod-id", this.mod.metadata.id);
        element.setAttribute("data-mod-name", this.mod.metadata.name);
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

        // @ts-ignore
        sprite.modSource = this.mod;

        const oldSprite = this.modLoader.lazySprites.get(spriteId);
        if (oldSprite) {
            LOG.error(
                "Sprite '" +
                    spriteId +
                    "' is provided twice, once by mod '" +
                    // @ts-ignore
                    oldSprite.modSource.metadata.name +
                    "' and once by mod '" +
                    this.mod.metadata.name +
                    "'. This could cause artifacts."
            );
        }
        this.modLoader.lazySprites.set(spriteId, sprite);
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
}
