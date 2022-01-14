/* typehints:start */
import { ModLoader } from "./modloader";
import { Component } from "../game/component";
import { MetaBuilding } from "../game/meta_building";
/* typehints:end */

import { defaultBuildingVariant } from "../game/meta_building";
import { createLogger } from "../core/logging";
import { AtlasSprite, SpriteAtlasLink } from "../core/sprites";
import {
    enumShortcodeToSubShape,
    enumSubShape,
    enumSubShapeToShortcode,
    MODS_ADDITIONAL_SUB_SHAPE_DRAWERS,
} from "../game/shape_definition";
import { Loader } from "../core/loader";
import { LANGUAGES } from "../languages";
import { matchDataRecursive, T } from "../translations";
import { gBuildingVariants, registerBuildingVariant } from "../game/building_codes";
import { gComponentRegistry, gMetaBuildingRegistry } from "../core/global_registries";
import { MODS_ADDITIONAL_SHAPE_MAP_WEIGHTS } from "../game/map_chunk";

const LOG = createLogger("mod-interface");

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
        Loader.sprites.set(spriteId, sprite);
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
     * @param {(options: import("../game/shape_definition").SubShapeDrawOptions) => void} param0.draw
     */
    registerSubShapeType({ id, shortCode, weightComputation, draw }) {
        if (shortCode.length !== 1) {
            throw new Error("Bad short code: " + shortCode);
        }
        enumSubShape[id] = id;
        enumSubShapeToShortcode[id] = shortCode;
        enumShortcodeToSubShape[shortCode] = id;

        MODS_ADDITIONAL_SHAPE_MAP_WEIGHTS[id] = weightComputation;
        MODS_ADDITIONAL_SUB_SHAPE_DRAWERS[id] = draw;
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

    /**
     *
     * @param {typeof Component} component
     */
    registerComponent(component) {
        gComponentRegistry.register(component);
    }

    /**
     *
     * @param {object} param0
     * @param {typeof MetaBuilding} param0.metaClass
     * @param {string=} param0.buildingIconBase64
     * @param {({
     *  variant?: string;
     *  rotationVariant?: number;
     *  name: string;
     *  description: string;
     *  blueprintImageBase64?: string;
     *  regularImageBase64?: string;
     *  tutorialImageBase64?: string;
     * }[])} param0.variantsAndRotations
     */
    registerNewBuilding({ metaClass, variantsAndRotations, buildingIconBase64 }) {
        const id = new /** @type {new () => MetaBuilding} */ (metaClass)().getId();
        if (gMetaBuildingRegistry.hasId(id)) {
            throw new Error("Tried to register building twice: " + id);
        }
        gMetaBuildingRegistry.register(metaClass);
        const metaInstance = gMetaBuildingRegistry.findByClass(metaClass);

        T.buildings[id] = {};
        variantsAndRotations.forEach(payload => {
            const actualVariant = payload.variant || defaultBuildingVariant;
            registerBuildingVariant(id, metaClass, actualVariant, payload.rotationVariant || 0);

            gBuildingVariants[id].metaInstance = metaInstance;

            T.buildings[id][actualVariant] = {
                name: payload.name,
                description: payload.description,
            };

            const buildingIdentifier =
                id + (actualVariant === defaultBuildingVariant ? "" : "-" + actualVariant);
            if (payload.regularImageBase64) {
                this.registerSprite(
                    "sprites/buildings/" + buildingIdentifier + ".png",
                    payload.regularImageBase64
                );
            }
            if (payload.blueprintImageBase64) {
                this.registerSprite(
                    "sprites/blueprints/" + buildingIdentifier + ".png",
                    payload.blueprintImageBase64
                );
            }
            if (payload.tutorialImageBase64) {
                this.setBuildingTutorialImage(id, actualVariant, payload.tutorialImageBase64);
            }
        });

        if (buildingIconBase64) {
            this.setBuildingToolbarIcon(id, buildingIconBase64);
        }
    }

    setBuildingToolbarIcon(buildingId, iconBase64) {
        this.registerCss(`
            [data-icon="building_icons/${buildingId}.png"] .icon {
                    background-image: url('${iconBase64}') !important;
            }
        `);
    }

    setBuildingTutorialImage(buildingId, variant, imageBase64) {
        const buildingIdentifier = buildingId + (variant === defaultBuildingVariant ? "" : "-" + variant);

        this.registerCss(`
            [data-icon="building_tutorials/${buildingIdentifier}.png"] {
                    background-image: url('${imageBase64}') !important;
            }
        `);
    }
}
