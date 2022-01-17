/* typehints:start */
import { ModLoader } from "./modloader";
import { GameSystem } from "../game/game_system";
import { Component } from "../game/component";
import { MetaBuilding } from "../game/meta_building";
/* typehints:end */

import { defaultBuildingVariant } from "../game/meta_building";
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
import { MODS_ADDITIONAL_SYSTEMS } from "../game/game_system_manager";
import { MOD_CHUNK_DRAW_HOOKS } from "../game/map_chunk_view";
import { KEYMAPPINGS } from "../game/key_action_mapper";
import { HUDModalDialogs } from "../game/hud/parts/modal_dialogs";
import { THEMES } from "../game/theme";
import { ModMetaBuilding } from "./mod_meta_building";

export class ModInterface {
    /**
     *
     * @param {ModLoader} modLoader
     */
    constructor(modLoader) {
        this.modLoader = modLoader;
    }

    registerCss(cssString) {
        // Preprocess css
        cssString = cssString.replace(/\$scaled\(([^\)]*)\)/gim, (substr, expression) => {
            return "calc((" + expression + ") * var(--ui-scale))";
        });
        const element = document.createElement("style");
        element.textContent = cssString;
        document.head.appendChild(element);
    }

    registerSprite(spriteId, base64string) {
        assert(base64string.startsWith("data:image"));
        const img = new Image();

        const sprite = new AtlasSprite(spriteId);
        sprite.frozen = true;

        img.addEventListener("load", () => {
            for (const resolution in sprite.linksByResolution) {
                const link = sprite.linksByResolution[resolution];
                link.w = img.width;
                link.h = img.height;
                link.packedW = img.width;
                link.packedH = img.height;
            }
        });

        img.src = base64string;

        const link = new SpriteAtlasLink({
            w: 1,
            h: 1,
            atlas: img,
            packOffsetX: 0,
            packOffsetY: 0,
            packedW: 1,
            packedH: 1,
            packedX: 0,
            packedY: 0,
        });

        sprite.linksByResolution["0.25"] = link;
        sprite.linksByResolution["0.5"] = link;
        sprite.linksByResolution["0.75"] = link;

        Loader.sprites.set(spriteId, sprite);
    }

    /**
     *
     * @param {string} imageBase64
     * @param {string} jsonTextData
     */
    registerAtlas(imageBase64, jsonTextData) {
        const atlasData = JSON.parse(jsonTextData);
        const img = new Image();
        img.src = imageBase64;

        const sourceData = atlasData.frames;
        for (const spriteName in sourceData) {
            const { frame, sourceSize, spriteSourceSize } = sourceData[spriteName];

            const sprite = new AtlasSprite(spriteName);
            Loader.sprites.set(spriteName, sprite);
            sprite.frozen = true;

            const link = new SpriteAtlasLink({
                packedX: frame.x,
                packedY: frame.y,
                packedW: frame.w,
                packedH: frame.h,
                packOffsetX: spriteSourceSize.x,
                packOffsetY: spriteSourceSize.y,
                atlas: img,
                w: sourceSize.w,
                h: sourceSize.h,
            });
            sprite.linksByResolution["0.25"] = link;
            sprite.linksByResolution["0.5"] = link;
            sprite.linksByResolution["0.75"] = link;
        }
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
     * @param {Object} param0
     * @param {string} param0.id
     * @param {new (any) => GameSystem} param0.systemClass
     * @param {string=} param0.before
     * @param {string[]=} param0.drawHooks
     */
    registerGameSystem({ id, systemClass, before, drawHooks }) {
        const key = before || "key";
        const payload = { id, systemClass };

        if (MODS_ADDITIONAL_SYSTEMS[key]) {
            MODS_ADDITIONAL_SYSTEMS[key].push(payload);
        } else {
            MODS_ADDITIONAL_SYSTEMS[key] = [payload];
        }
        if (drawHooks) {
            drawHooks.forEach(hookId => this.registerGameSystemDrawHook(hookId, id));
        }
    }

    /**
     *
     * @param {string} hookId
     * @param {string} systemId
     */
    registerGameSystemDrawHook(hookId, systemId) {
        if (!MOD_CHUNK_DRAW_HOOKS[hookId]) {
            throw new Error("bad game system draw hook: " + hookId);
        }
        MOD_CHUNK_DRAW_HOOKS[hookId].push(systemId);
    }

    /**
     *
     * @param {object} param0
     * @param {typeof ModMetaBuilding} param0.metaClass
     * @param {string=} param0.buildingIconBase64
     */
    registerNewBuilding({ metaClass, buildingIconBase64 }) {
        const id = new /** @type {new (...args) => ModMetaBuilding} */ (metaClass)().getId();
        if (gMetaBuildingRegistry.hasId(id)) {
            throw new Error("Tried to register building twice: " + id);
        }
        gMetaBuildingRegistry.register(metaClass);
        const metaInstance = gMetaBuildingRegistry.findByClass(metaClass);
        T.buildings[id] = {};

        metaClass.getAllVariantCombinations().forEach(combination => {
            const variant = combination.variant || defaultBuildingVariant;
            const rotationVariant = combination.rotationVariant || 0;

            const buildingIdentifier = id + (variant === defaultBuildingVariant ? "" : "-" + variant);

            const uniqueTypeId = buildingIdentifier + (rotationVariant === 0 ? "" : "-" + rotationVariant);
            registerBuildingVariant(uniqueTypeId, metaClass, variant, rotationVariant);

            gBuildingVariants[id].metaInstance = metaInstance;

            T.buildings[id][variant] = {
                name: combination.name || "Name",
                description: combination.description || "Description",
            };

            if (combination.regularImageBase64) {
                this.registerSprite(
                    "sprites/buildings/" + buildingIdentifier + ".png",
                    combination.regularImageBase64
                );
            }

            if (combination.blueprintImageBase64) {
                this.registerSprite(
                    "sprites/blueprints/" + buildingIdentifier + ".png",
                    combination.blueprintImageBase64
                );
            }
            if (combination.tutorialImageBase64) {
                this.setBuildingTutorialImage(id, variant, combination.tutorialImageBase64);
            }
        });

        if (buildingIconBase64) {
            this.setBuildingToolbarIcon(id, buildingIconBase64);
        }
    }

    /**
     *
     * @param {Object} param0
     * @param {string} param0.id
     * @param {number} param0.keyCode
     * @param {string} param0.translation
     * @param {boolean=} param0.repeated
     * @param {((GameRoot) => void)=} param0.handler
     * @param {{shift?: boolean; alt?: boolean; ctrl?: boolean}=} param0.modifiers
     * @param {boolean=} param0.builtin
     */
    registerIngameKeybinding({
        id,
        keyCode,
        translation,
        modifiers = {},
        repeated = false,
        builtin = false,
        handler = null,
    }) {
        if (!KEYMAPPINGS.mods) {
            KEYMAPPINGS.mods = {};
        }
        const binding = (KEYMAPPINGS.mods[id] = {
            keyCode,
            id,
            repeated,
            modifiers,
            builtin,
        });
        this.registerTranslations("en", {
            keybindings: {
                mappings: {
                    [id]: translation,
                },
            },
        });

        if (handler) {
            this.modLoader.signals.gameStarted.add(root => {
                root.keyMapper.getBindingById(id).addToTop(handler.bind(null, root));
            });
        }

        return binding;
    }

    /**
     * @returns {HUDModalDialogs}
     */
    get dialogs() {
        const state = this.modLoader.app.stateMgr.currentState;
        // @ts-ignore
        if (state.dialogs) {
            // @ts-ignore
            return state.dialogs;
        }
        throw new Error("Tried to access dialogs but current state doesn't support it");
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

    /**
     * @param {Object} param0
     * @param {string} param0.id
     * @param {string} param0.name
     * @param {Object} param0.theme
     */
    registerGameTheme({ id, name, theme }) {
        THEMES[id] = theme;
        this.registerTranslations("en", {
            settings: {
                labels: {
                    theme: {
                        themes: {
                            [id]: name,
                        },
                    },
                },
            },
        });
    }

    /**
     * @param {object} param0
     * @param {"regular"|"wires"} param0.toolbar
     * @param {"primary"|"secondary"} param0.location
     * @param {typeof MetaBuilding} param0.metaClass
     */
    addNewBuildingToToolbar({ toolbar, location, metaClass }) {
        const hudElementName = toolbar === "wires" ? "HUDWiresToolbar" : "HUDBuildingsToolbar";
        const property = location === "secondary" ? "secondaryBuildings" : "primaryBuildings";

        this.modLoader.signals.hudElementInitialized.add(element => {
            if (element.constructor.name === hudElementName) {
                element[property].push(metaClass);
            }
        });
    }

    /**
     * Patches a method on a given object
     */
    replaceMethod(classHandle, methodName, override) {
        const oldMethod = classHandle.prototype[methodName];
        classHandle.prototype[methodName] = function () {
            return override.call(this, oldMethod.bind(this), arguments);
        };
    }

    runBeforeMethod(classHandle, methodName, executeBefore) {
        const oldHandle = classHandle.prototype[methodName];
        classHandle.prototype[methodName] = function () {
            executeBefore.apply(this, arguments);
            return oldHandle.apply(this, arguments);
        };
    }

    runAfterMethod(classHandle, methodName, executeAfter) {
        const oldHandle = classHandle.prototype[methodName];
        classHandle.prototype[methodName] = function () {
            const returnValue = oldHandle.apply(this, arguments);
            executeAfter.apply(this, arguments);
            return returnValue;
        };
    }

    /**
     *
     * @param {Object} obj
     * @param {({ $super, $old }) => any} extender
     */
    extendObject(obj, extender) {
        const prototype = obj.prototype;

        const $super = Object.getPrototypeOf(prototype);
        const $old = {};
        const extensionMethods = extender({ $super, $old });
        const properties = Array.from(Object.getOwnPropertyNames(extensionMethods));
        properties.forEach(propertyName => {
            if (["constructor", "prototype"].includes(propertyName)) {
                return;
            }
            $old[propertyName] = prototype[propertyName];
            prototype[propertyName] = extensionMethods[propertyName];
        });
    }

    /**
     *
     * @param {typeof Object} classHandle
     * @param {({ $super, $old }) => any} extender
     */
    extendClass(classHandle, extender) {
        this.extendObject(classHandle.prototype, extender);
    }
}
