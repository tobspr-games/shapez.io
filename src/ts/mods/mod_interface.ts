/* typehints:start */
import type { ModLoader } from "./modloader";
import type { GameSystem } from "../game/game_system";
import type { Component } from "../game/component";
import type { MetaBuilding } from "../game/meta_building";
/* typehints:end */
import { defaultBuildingVariant } from "../game/meta_building";
import { AtlasSprite, SpriteAtlasLink } from "../core/sprites";
import { enumShortcodeToSubShape, enumSubShape, enumSubShapeToShortcode, MODS_ADDITIONAL_SUB_SHAPE_DRAWERS, } from "../game/shape_definition";
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
export type constructable = {
    new (...args: any);
    prototype: any;
};
export type bindThis = (this: T, ...args: Parameters<F>) => ReturnType<F>;
export type beforePrams = (...args: [
    P,
    Parameters<F>
]) => ReturnType<F>;
export type afterPrams = (...args: [
    ...Parameters<F>,
    P
]) => ReturnType<F>;
export type extendsPrams = (...args: [
    ...Parameters<F>,
    ...any
]) => ReturnType<F>;





export class ModInterface {
    public modLoader = modLoader;

        constructor(modLoader) {
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
        registerAtlas(imageBase64: string, jsonTextData: string) {
        const atlasData = JSON.parse(jsonTextData);
        const img = new Image();
        img.src = imageBase64;
        const sourceData = atlasData.frames;
        for (const spriteName in sourceData) {
            const { frame, sourceSize, spriteSourceSize } = sourceData[spriteName];
            let sprite = Loader.sprites.get(spriteName) as AtlasSprite);
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
            }
            else {
                sprite.linksByResolution["0.25"] = link;
                sprite.linksByResolution["0.5"] = link;
                sprite.linksByResolution["0.75"] = link;
            }
        }
    }
        registerSubShapeType({ id, shortCode, weightComputation, draw }: {
        id: string;
        shortCode: string;
        weightComputation: (distanceToOriginInChunks: number) => number;
        draw: (options: import("../game/shape_definition").SubShapeDrawOptions) => void;
    }) {
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
        registerItem(item: typeof BaseItem, resolver: (itemData: any) => BaseItem) {
        gItemRegistry.register(item);
        MODS_ADDITIONAL_ITEMS[item.getId()] = resolver;
    }
        registerComponent(component: typeof Component) {
        gComponentRegistry.register(component);
    }
        registerGameSystem({ id, systemClass, before, drawHooks }: {
        id: string;
        systemClass: new (any) => GameSystem;
        before: string=;
        drawHooks: string[]=;
    }) {
        const key = before || "key";
        const payload = { id, systemClass };
        if (MODS_ADDITIONAL_SYSTEMS[key]) {
            MODS_ADDITIONAL_SYSTEMS[key].push(payload);
        }
        else {
            MODS_ADDITIONAL_SYSTEMS[key] = [payload];
        }
        if (drawHooks) {
            drawHooks.forEach(hookId => this.registerGameSystemDrawHook(hookId, id));
        }
    }
        registerGameSystemDrawHook(hookId: string, systemId: string) {
        if (!MOD_CHUNK_DRAW_HOOKS[hookId]) {
            throw new Error("bad game system draw hook: " + hookId);
        }
        MOD_CHUNK_DRAW_HOOKS[hookId].push(systemId);
    }
        registerNewBuilding({ metaClass, buildingIconBase64 }: {
        metaClass: typeof ModMetaBuilding;
        buildingIconBase64: string=;
    }) {
        const id = new metaClass as new (...args) => ModMetaBuilding)().getId();
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
                this.registerSprite("sprites/buildings/" + buildingIdentifier + ".png", combination.regularImageBase64);
            }
            if (combination.blueprintImageBase64) {
                this.registerSprite("sprites/blueprints/" + buildingIdentifier + ".png", combination.blueprintImageBase64);
            }
            if (combination.tutorialImageBase64) {
                this.setBuildingTutorialImage(id, variant, combination.tutorialImageBase64);
            }
        });
        if (buildingIconBase64) {
            this.setBuildingToolbarIcon(id, buildingIconBase64);
        }
    }
        registerIngameKeybinding({ id, keyCode, translation, modifiers = {}, repeated = false, builtin = false, handler = null, }: {
        id: string;
        keyCode: number;
        translation: string;
        repeated: boolean=;
        handler: ((GameRoot) => void)=;
        modifiers: {
            shift?: boolean;
            alt?: boolean;
            ctrl?: boolean;
        }=;
        builtin: boolean=;
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
     * {}
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
     * 
    etBuildingTutorialImage(buldingIdOrClass: string | (new () => MetaBuilding), variant: *, imageBase64: *) {
        if (typeof buildingIdOrClass === "function") {
            buildingIdOrClass = new buildingIdOrClass().id;
        }
        const buildingIdentifier = buildingIdOrClass + (variant === defaultBuildingVariant ? "" : "-" + variant);
        this.registerCss(`
            [data-icon="building_tutorials/${buildingIdentifier}.png"] {
                    background-image: url('${imageBase64}') !important;
            }
        `);
    }
    /**
     */
    registerGameTheme({ id, name, theme }: {
        id: string;
        name: string;
        theme: Object;
    }) {
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
     */
    registerGameState(stateClass: typeof import("../core/game_state").GameState) {
        this.modLoader.app.stateMgr.register(stateClass);
    }
        addNewBuildingToToolbar({ toolbar, location, metaClass }: {
        toolbar: "regular" | "wires";
        location: "primary" | "secondary";
        metaClass: typeof MetaBuilding;
    }) {
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
     */
    replaceMethod(classHandle: C, methodName: M, override: bindThis<beforePrams<O, P[M]>, InstanceType<C>>) {
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
     */
    runBeforeMethod(classHandle: C, methodName: M, executeBefore: bindThis<O, InstanceType<C>>) {
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
     */
    runAfterMethod(classHandle: C, methodName: M, executeAfter: bindThis<O, InstanceType<C>>) {
        const oldHandle = classHandle.prototype[methodName];
        classHandle.prototype[methodName] = function () {
            const returnValue = oldHandle.apply(this, arguments);
            //@ts-ignore
            executeAfter.apply(this, arguments);
            return returnValue;
        };
    }
        extendObject(prototype: Object, extender: ({ $super, $old }) => any) {
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
        extendClass(classHandle: Class, extender: ({ $super, $old }) => any) {
        this.extendObject(classHandle.prototype, extender);
    }
        registerHudElement(id: string, element: new (...args) => BaseHUDPart) {
        this.modLoader.signals.hudInitializer.add(root => {
            root.hud.parts[id] = new element(root);
        });
    }
        registerBuildingTranslation(buildingIdOrClass: string | (new () => MetaBuilding), variant: string, { name, description, language = "en" }: {
        name: string;
        description: string;
        language: string=;
    }) {
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
        registerBuildingSprites(buildingIdOrClass: string | (new () => MetaBuilding), variant: string, { regularBase64, blueprintBase64 }: {
        regularBase64: string=;
        blueprintBase64: string=;
    }) {
        if (typeof buildingIdOrClass === "function") {
            buildingIdOrClass = new buildingIdOrClass().id;
        }
        const spriteId = buildingIdOrClass + (variant === defaultBuildingVariant ? "" : "-" + variant) + ".png";
        if (regularBase64) {
            this.registerSprite("sprites/buildings/" + spriteId, regularBase64);
        }
        if (blueprintBase64) {
            this.registerSprite("sprites/blueprints/" + spriteId, blueprintBase64);
        }
    }
        addVariantToExistingBuilding(metaClass: new () => MetaBuilding, variant: string, payload: {
        rotationVariants: number[]=;
        tutorialImageBase64: string=;
        regularSpriteBase64: string=;
        blueprintSpriteBase64: string=;
        name: string=;
        description: string=;
        dimensions: Vector=;
        additionalStatistics: (root: GameRoot) => [
            string,
            string
        ][]=;
        isUnlocked: (root: GameRoot) => boolean[]=;
    }) {
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
        payload.rotationVariants.forEach(rotationVariant => shapez.registerBuildingVariant(rotationVariant ? internalId + "-" + rotationVariant : internalId, metaClass, variant, rotationVariant));
    }
}
