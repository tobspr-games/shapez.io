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
import { gComponentRegistry, gItemRegistry, gMetaBuildingRegistry } from "../core/global_registries";
import { MODS_ADDITIONAL_SHAPE_MAP_WEIGHTS } from "../game/map_chunk";
import { MODS_ADDITIONAL_SYSTEMS } from "../game/game_system_manager";
import { MOD_CHUNK_DRAW_HOOKS } from "../game/map_chunk_view";
import { KEYMAPPINGS } from "../game/key_action_mapper";
import { HUDModalDialogs } from "../game/hud/parts/modal_dialogs";
import { THEMES } from "../game/theme";
import { ModMetaBuilding } from "./mod_meta_building";
import { BaseHUDPart } from "../game/hud/base_hud_part";
import { Vector } from "../core/vector";
import { GameRoot } from "../game/root";
import { BaseItem } from "../game/base_item";
import { MODS_ADDITIONAL_ITEMS } from "../game/item_resolver";

/**
 * @typedef {{new(...args: any[]): any, prototype: any}} constructable
 */

/**
 * @template {(...args: any) => any} F The function
 * @template {object} T  The value of this
 * @typedef {(this: T, ...args: Parameters<F>) => ReturnType<F>} bindThis
 */

/**
 * @template {(...args: any[]) => any} F
 * @template P
 * @typedef {(...args: [P, Parameters<F>]) => ReturnType<F>} beforePrams IMPORTANT: this puts the original parameters into an array
 */

/**
 * @template {(...args: any[]) => any} F
 * @template P
 * @typedef {(...args: [...Parameters<F>, P]) => ReturnType<F>} afterPrams
 */

/**
 * @template {(...args: any[]) => any} F
 * @typedef {(...args: [...Parameters<F>, ...any]) => ReturnType<F>} extendsPrams
 */

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
        cssString = cssString.replace(/\$scaled\(([^)]*)\)/gim, (substr, expression) => {
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

            let sprite = /** @type {AtlasSprite} */ (Loader.sprites.get(spriteName));

            if (!sprite) {
                sprite = new AtlasSprite(spriteName);
                Loader.sprites.set(spriteName, sprite);
            }

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

            if (atlasData.meta && atlasData.meta.scale) {
                sprite.linksByResolution[atlasData.meta.scale] = link;
            } else {
                sprite.linksByResolution["0.25"] = link;
                sprite.linksByResolution["0.5"] = link;
                sprite.linksByResolution["0.75"] = link;
            }
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
     * @param {typeof BaseItem} item
     * @param {(itemData: any) => BaseItem} resolver
     */
    registerItem(item, resolver) {
        gItemRegistry.register(item);
        MODS_ADDITIONAL_ITEMS[item.getId()] = resolver;
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

            this.registerTranslations("en", {
                buildings: {
                    [id]: {
                        [variant]: {
                            name: combination.name || "Name",
                            description: combination.description || "Description",
                        },
                    },
                },
            });

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

    /**
     *
     * @param {string | (new () => MetaBuilding)} buildingIdOrClass
     * @param {*} variant
     * @param {*} imageBase64
     */
    setBuildingTutorialImage(buildingIdOrClass, variant, imageBase64) {
        if (typeof buildingIdOrClass === "function") {
            buildingIdOrClass = new buildingIdOrClass().id;
        }
        const buildingIdentifier =
            buildingIdOrClass + (variant === defaultBuildingVariant ? "" : "-" + variant);

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
     * Registers a new state class, should be a GameState derived class
     * @param {typeof import("../core/game_state").GameState} stateClass
     */
    registerGameState(stateClass) {
        this.modLoader.app.stateMgr.register(stateClass);
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
     * Patches a method on a given class
     * @template {constructable} C  the class
     * @template {C["prototype"]} P  the prototype of said class
     * @template {keyof P} M  the name of the method we are overriding
     * @template {extendsPrams<P[M]>} O the method that will override the old one
     * @param {C} classHandle
     * @param {M} methodName
     * @param {bindThis<beforePrams<O, P[M]>, InstanceType<C>>} override
     */
    replaceMethod(classHandle, methodName, override) {
        const oldMethod = classHandle.prototype[methodName];
        classHandle.prototype[methodName] = function () {
            //@ts-ignore This is true I just cant tell it that arguments will be Arguments<O>
            return override.call(this, oldMethod.bind(this), arguments);
        };
    }

    /**
     * Runs before a method on a given class
     * @template {constructable} C  the class
     * @template {C["prototype"]} P  the prototype of said class
     * @template {keyof P} M  the name of the method we are overriding
     * @template {extendsPrams<P[M]>} O the method that will run before the old one
     * @param {C} classHandle
     * @param {M} methodName
     * @param {bindThis<O, InstanceType<C>>} executeBefore
     */
    runBeforeMethod(classHandle, methodName, executeBefore) {
        const oldHandle = classHandle.prototype[methodName];
        classHandle.prototype[methodName] = function () {
            //@ts-ignore Same as above
            executeBefore.apply(this, arguments);
            return oldHandle.apply(this, arguments);
        };
    }

    /**
     * Runs after a method on a given class
     * @template {constructable} C  the class
     * @template {C["prototype"]} P  the prototype of said class
     * @template {keyof P} M  the name of the method we are overriding
     * @template {extendsPrams<P[M]>} O the method that will run before the old one
     * @param {C} classHandle
     * @param {M} methodName
     * @param {bindThis<O, InstanceType<C>>} executeAfter
     */
    runAfterMethod(classHandle, methodName, executeAfter) {
        const oldHandle = classHandle.prototype[methodName];
        classHandle.prototype[methodName] = function () {
            const returnValue = oldHandle.apply(this, arguments);
            //@ts-ignore
            executeAfter.apply(this, arguments);
            return returnValue;
        };
    }

    /**
     *
     * @param {Object} prototype
     * @param {({ $super, $old }) => any} extender
     */
    extendObject(prototype, extender) {
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
     * @param {Class} classHandle
     * @param {({ $super, $old }) => any} extender
     */
    extendClass(classHandle, extender) {
        this.extendObject(classHandle.prototype, extender);
    }

    /**
     *
     * @param {string} id
     * @param {new (...args) => BaseHUDPart} element
     */
    registerHudElement(id, element) {
        this.modLoader.signals.hudInitializer.add(root => {
            root.hud.parts[id] = new element(root);
        });
    }

    /**
     *
     * @param {string | (new () => MetaBuilding)} buildingIdOrClass
     * @param {string} variant
     * @param {object} param0
     * @param {string} param0.name
     * @param {string} param0.description
     * @param {string=} param0.language
     */
    registerBuildingTranslation(buildingIdOrClass, variant, { name, description, language = "en" }) {
        if (typeof buildingIdOrClass === "function") {
            buildingIdOrClass = new buildingIdOrClass().id;
        }
        this.registerTranslations(language, {
            buildings: {
                [buildingIdOrClass]: {
                    [variant]: {
                        name,
                        description,
                    },
                },
            },
        });
    }

    /**
     *
     * @param {string | (new () => MetaBuilding)} buildingIdOrClass
     * @param {string} variant
     * @param {object} param2
     * @param {string=} param2.regularBase64
     * @param {string=} param2.blueprintBase64
     */
    registerBuildingSprites(buildingIdOrClass, variant, { regularBase64, blueprintBase64 }) {
        if (typeof buildingIdOrClass === "function") {
            buildingIdOrClass = new buildingIdOrClass().id;
        }

        const spriteId =
            buildingIdOrClass + (variant === defaultBuildingVariant ? "" : "-" + variant) + ".png";

        if (regularBase64) {
            this.registerSprite("sprites/buildings/" + spriteId, regularBase64);
        }

        if (blueprintBase64) {
            this.registerSprite("sprites/blueprints/" + spriteId, blueprintBase64);
        }
    }

    /**
     * @param {new () => MetaBuilding} metaClass
     * @param {string} variant
     * @param {object} payload
     * @param {number[]=} payload.rotationVariants
     * @param {string=} payload.tutorialImageBase64
     * @param {string=} payload.regularSpriteBase64
     * @param {string=} payload.blueprintSpriteBase64
     * @param {string=} payload.name
     * @param {string=} payload.description
     * @param {Vector=} payload.dimensions
     * @param {(root: GameRoot) => [string, string][]=} payload.additionalStatistics
     * @param {(root: GameRoot) => boolean[]=} payload.isUnlocked
     */
    addVariantToExistingBuilding(metaClass, variant, payload) {
        if (!payload.rotationVariants) {
            payload.rotationVariants = [0];
        }

        if (payload.tutorialImageBase64) {
            this.setBuildingTutorialImage(metaClass, variant, payload.tutorialImageBase64);
        }
        if (payload.regularSpriteBase64) {
            this.registerBuildingSprites(metaClass, variant, { regularBase64: payload.regularSpriteBase64 });
        }
        if (payload.blueprintSpriteBase64) {
            this.registerBuildingSprites(metaClass, variant, {
                blueprintBase64: payload.blueprintSpriteBase64,
            });
        }
        if (payload.name && payload.description) {
            this.registerBuildingTranslation(metaClass, variant, {
                name: payload.name,
                description: payload.description,
            });
        }

        const internalId = new metaClass().getId() + "-" + variant;

        // Extend static methods
        this.extendObject(metaClass, ({ $old }) => ({
            getAllVariantCombinations() {
                return [
                    ...$old.bind(this).getAllVariantCombinations(),
                    ...payload.rotationVariants.map(rotationVariant => ({
                        internalId,
                        variant,
                        rotationVariant,
                    })),
                ];
            },
        }));

        // Dimensions
        const $variant = variant;
        if (payload.dimensions) {
            this.extendClass(metaClass, ({ $old }) => ({
                getDimensions(variant) {
                    if (variant === $variant) {
                        return payload.dimensions;
                    }
                    return $old.getDimensions.bind(this)(...arguments);
                },
            }));
        }

        if (payload.additionalStatistics) {
            this.extendClass(metaClass, ({ $old }) => ({
                getAdditionalStatistics(root, variant) {
                    if (variant === $variant) {
                        return payload.additionalStatistics(root);
                    }
                    return $old.getAdditionalStatistics.bind(this)(root, variant);
                },
            }));
        }

        if (payload.isUnlocked) {
            this.extendClass(metaClass, ({ $old }) => ({
                getAvailableVariants(root) {
                    if (payload.isUnlocked(root)) {
                        return [...$old.getAvailableVariants.bind(this)(root), $variant];
                    }
                    return $old.getAvailableVariants.bind(this)(root);
                },
            }));
        }

        // Register our variant finally, with rotation variants
        payload.rotationVariants.forEach(rotationVariant =>
            shapez.registerBuildingVariant(
                rotationVariant ? internalId + "-" + rotationVariant : internalId,
                metaClass,
                variant,
                rotationVariant
            )
        );
    }
}
