/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
import { ReadWriteProxy } from "../core/read_write_proxy";
import { BoolSetting, EnumSetting, RangeSetting, BaseSetting } from "./setting_types";
import { createLogger } from "../core/logging";
import { ExplainedResult } from "../core/explained_result";
import { THEMES, applyGameTheme } from "../game/theme";
import { T } from "../translations";
import { LANGUAGES } from "../languages";
const logger: any = createLogger("application_settings");
/**
 * @enum {string}
 */
export const enumCategories: any = {
    general: "general",
    userInterface: "userInterface",
    performance: "performance",
    advanced: "advanced",
};
export const uiScales: any = [
    {
        id: "super_small",
        size: 0.6,
    },
    {
        id: "small",
        size: 0.8,
    },
    {
        id: "regular",
        size: 1,
    },
    {
        id: "large",
        size: 1.05,
    },
    {
        id: "huge",
        size: 1.1,
    },
];
export const scrollWheelSensitivities: any = [
    {
        id: "super_slow",
        scale: 0.25,
    },
    {
        id: "slow",
        scale: 0.5,
    },
    {
        id: "regular",
        scale: 1,
    },
    {
        id: "fast",
        scale: 2,
    },
    {
        id: "super_fast",
        scale: 4,
    },
];
export const movementSpeeds: any = [
    {
        id: "super_slow",
        multiplier: 0.25,
    },
    {
        id: "slow",
        multiplier: 0.5,
    },
    {
        id: "regular",
        multiplier: 1,
    },
    {
        id: "fast",
        multiplier: 2,
    },
    {
        id: "super_fast",
        multiplier: 4,
    },
    {
        id: "extremely_fast",
        multiplier: 8,
    },
];
export const autosaveIntervals: any = [
    {
        id: "one_minute",
        seconds: 60,
    },
    {
        id: "two_minutes",
        seconds: 120,
    },
    {
        id: "five_minutes",
        seconds: 5 * 60,
    },
    {
        id: "ten_minutes",
        seconds: 10 * 60,
    },
    {
        id: "twenty_minutes",
        seconds: 20 * 60,
    },
    {
        id: "disabled",
        seconds: null,
    },
];
export const refreshRateOptions: any = ["30", "60", "120", "180", "240"];
if (G_IS_DEV) {
    refreshRateOptions.unshift("10");
    refreshRateOptions.unshift("5");
    refreshRateOptions.push("1000");
    refreshRateOptions.push("2000");
    refreshRateOptions.push("5000");
    refreshRateOptions.push("10000");
}
/** {} */
function initializeSettings(): Array<BaseSetting> {
    return [
        new EnumSetting("language", {
            options: Object.keys(LANGUAGES),
            valueGetter: (key: any): any => key,
            textGetter: (key: any): any => LANGUAGES[key].name,
            category: enumCategories.general,
            restartRequired: true,
            changeCb: (app: any, id: any): any => null,
            magicValue: "auto-detect",
        }),
        new EnumSetting("uiScale", {
            options: uiScales.sort((a: any, b: any): any => a.size - b.size),
            valueGetter: (scale: any): any => scale.id,
            textGetter: (scale: any): any => T.settings.labels.uiScale.scales[scale.id],
            category: enumCategories.userInterface,
            restartRequired: false,
            changeCb: 
                        (app: Application, id: any): any => app.updateAfterUiScaleChanged(),
        }),
        new RangeSetting("soundVolume", enumCategories.general, 
                (app: Application, value: any): any => app.sound.setSoundVolume(value)),
        new RangeSetting("musicVolume", enumCategories.general, 
                (app: Application, value: any): any => app.sound.setMusicVolume(value)),
        new BoolSetting("fullscreen", enumCategories.general, 
                (app: Application, value: any): any => {
            if (app.platformWrapper.getSupportsFullscreen()) {
                app.platformWrapper.setFullscreen(value);
            }
        }, 
        app: Application): any => G_IS_STANDALONE),
        new BoolSetting("enableColorBlindHelper", enumCategories.general, 
                (app: Application, value: any): any => null),
        new BoolSetting("offerHints", enumCategories.userInterface, (app: any, value: any): any => { }),
        new EnumSetting("theme", {
            options: Object.keys(THEMES),
            valueGetter: (theme: any): any => theme,
            textGetter: (theme: any): any => T.settings.labels.theme.themes[theme],
            category: enumCategories.userInterface,
            restartRequired: false,
            changeCb: 
                        (app: Application, id: any): any => {
                applyGameTheme(id);
                document.documentElement.setAttribute("data-theme", id);
            },
            enabledCb: pp: Application): any => app.restrictionMgr.getHasExtendedSettings(),
        }),
        new EnumSetting("autosaveInterval", {
            options: autosaveIntervals,
            valueGetter: (interval: any): any => interval.id,
            textGetter: (interval: any): any => T.settings.labels.autosaveInterval.intervals[interval.id],
            category: enumCategories.advanced,
            restartRequired: false,
            changeCb: 
                        (app: Application, id: any): any => null,
        }),
        new EnumSetting("scrollWheelSensitivity", {
            options: scrollWheelSensitivities.sort((a: any, b: any): any => a.scale - b.scale),
            valueGetter: (scale: any): any => scale.id,
            textGetter: (scale: any): any => T.settings.labels.scrollWheelSensitivity.sensitivity[scale.id],
            category: enumCategories.advanced,
            restartRequired: false,
            changeCb: 
                        (app: Application, id: any): any => app.updateAfterUiScaleChanged(),
        }),
        new EnumSetting("movementSpeed", {
            options: movementSpeeds.sort((a: any, b: any): any => a.multiplier - b.multiplier),
            valueGetter: (multiplier: any): any => multiplier.id,
            textGetter: (multiplier: any): any => T.settings.labels.movementSpeed.speeds[multiplier.id],
            category: enumCategories.advanced,
            restartRequired: false,
            changeCb: (app: any, id: any): any => { },
        }),
        new BoolSetting("enableMousePan", enumCategories.advanced, (app: any, value: any): any => { }),
        new BoolSetting("shapeTooltipAlwaysOn", enumCategories.advanced, (app: any, value: any): any => { }),
        new BoolSetting("alwaysMultiplace", enumCategories.advanced, (app: any, value: any): any => { }),
        new BoolSetting("zoomToCursor", enumCategories.advanced, (app: any, value: any): any => { }),
        new BoolSetting("clearCursorOnDeleteWhilePlacing", enumCategories.advanced, (app: any, value: any): any => { }),
        new BoolSetting("enableTunnelSmartplace", enumCategories.advanced, (app: any, value: any): any => { }),
        new BoolSetting("vignette", enumCategories.userInterface, (app: any, value: any): any => { }),
        new BoolSetting("compactBuildingInfo", enumCategories.userInterface, (app: any, value: any): any => { }),
        new BoolSetting("disableCutDeleteWarnings", enumCategories.advanced, (app: any, value: any): any => { }),
        new BoolSetting("rotationByBuilding", enumCategories.advanced, (app: any, value: any): any => { }),
        new BoolSetting("displayChunkBorders", enumCategories.advanced, (app: any, value: any): any => { }),
        new BoolSetting("pickMinerOnPatch", enumCategories.advanced, (app: any, value: any): any => { }),
        new RangeSetting("mapResourcesScale", enumCategories.advanced, (): any => null),
        new EnumSetting("refreshRate", {
            options: refreshRateOptions,
            valueGetter: (rate: any): any => rate,
            textGetter: (rate: any): any => T.settings.tickrateHz.replace("<amount>", rate),
            category: enumCategories.performance,
            restartRequired: false,
            changeCb: (app: any, id: any): any => { },
            enabledCb: pp: Application): any => app.restrictionMgr.getHasExtendedSettings(),
        }),
        new BoolSetting("lowQualityMapResources", enumCategories.performance, (app: any, value: any): any => { }),
        new BoolSetting("disableTileGrid", enumCategories.performance, (app: any, value: any): any => { }),
        new BoolSetting("lowQualityTextures", enumCategories.performance, (app: any, value: any): any => { }),
        new BoolSetting("simplifiedBelts", enumCategories.performance, (app: any, value: any): any => { }),
    ];
}
class SettingsStorage {
    public uiScale = "regular";
    public fullscreen = G_IS_STANDALONE;
    public soundVolume = 1.0;
    public musicVolume = 1.0;
    public theme = "light";
    public refreshRate = "60";
    public scrollWheelSensitivity = "regular";
    public movementSpeed = "regular";
    public language = "auto-detect";
    public autosaveInterval = "two_minutes";
    public alwaysMultiplace = false;
    public shapeTooltipAlwaysOn = false;
    public offerHints = true;
    public enableTunnelSmartplace = true;
    public vignette = true;
    public compactBuildingInfo = false;
    public disableCutDeleteWarnings = false;
    public rotationByBuilding = true;
    public clearCursorOnDeleteWhilePlacing = true;
    public displayChunkBorders = false;
    public pickMinerOnPatch = true;
    public enableMousePan = true;
    public enableColorBlindHelper = false;
    public lowQualityMapResources = false;
    public disableTileGrid = false;
    public lowQualityTextures = false;
    public simplifiedBelts = false;
    public zoomToCursor = true;
    public mapResourcesScale = 0.5;
    public keybindingOverrides: {
        [idx: string]: number;
    } = {};

    constructor() {
    }
}
export class ApplicationSettings extends ReadWriteProxy {
    public settingHandles = initializeSettings();

    constructor(app) {
        super(app, "app_settings.bin");
    }
    initialize(): any {
        // Read and directly write latest data back
        return this.readAsync()
            .then((): any => {
            // Apply default setting callbacks
            const settings: any = this.getAllSettings();
            for (let i: any = 0; i < this.settingHandles.length; ++i) {
                const handle: any = this.settingHandles[i];
                handle.apply(this.app, settings[handle.id]);
            }
        })
            .then((): any => this.writeAsync());
    }
    save(): any {
        return this.writeAsync();
    }
    getSettingHandleById(id: any): any {
        return this.settingHandles.find((setting: any): any => setting.id === id);
    }
    // Getters
    /**
     * {}
     */
    getAllSettings(): SettingsStorage {
        return this.currentData.settings;
    }
        getSetting(key: string): any {
        assert(this.getAllSettings().hasOwnProperty(key), "Setting not known: " + key);
        return this.getAllSettings()[key];
    }
    getInterfaceScaleId(): any {
        if (!this.currentData) {
            // Not initialized yet
            return "regular";
        }
        return this.getAllSettings().uiScale;
    }
    getDesiredFps(): any {
        return parseInt(this.getAllSettings().refreshRate);
    }
    getInterfaceScaleValue(): any {
        const id: any = this.getInterfaceScaleId();
        for (let i: any = 0; i < uiScales.length; ++i) {
            if (uiScales[i].id === id) {
                return uiScales[i].size;
            }
        }
        logger.error("Unknown ui scale id:", id);
        return 1;
    }
    getScrollWheelSensitivity(): any {
        const id: any = this.getAllSettings().scrollWheelSensitivity;
        for (let i: any = 0; i < scrollWheelSensitivities.length; ++i) {
            if (scrollWheelSensitivities[i].id === id) {
                return scrollWheelSensitivities[i].scale;
            }
        }
        logger.error("Unknown scroll wheel sensitivity id:", id);
        return 1;
    }
    getMovementSpeed(): any {
        const id: any = this.getAllSettings().movementSpeed;
        for (let i: any = 0; i < movementSpeeds.length; ++i) {
            if (movementSpeeds[i].id === id) {
                return movementSpeeds[i].multiplier;
            }
        }
        logger.error("Unknown movement speed id:", id);
        return 1;
    }
    getAutosaveIntervalSeconds(): any {
        const id: any = this.getAllSettings().autosaveInterval;
        for (let i: any = 0; i < autosaveIntervals.length; ++i) {
            if (autosaveIntervals[i].id === id) {
                return autosaveIntervals[i].seconds;
            }
        }
        logger.error("Unknown autosave interval id:", id);
        return 120;
    }
    getIsFullScreen(): any {
        return this.getAllSettings().fullscreen;
    }
    getKeybindingOverrides(): any {
        return this.getAllSettings().keybindingOverrides;
    }
    getLanguage(): any {
        return this.getAllSettings().language;
    }
    // Setters
    updateLanguage(id: any): any {
        assert(LANGUAGES[id], "Language not known: " + id);
        return this.updateSetting("language", id);
    }
        updateSetting(key: string, value: string | boolean | number): any {
        const setting: any = this.getSettingHandleById(key);
        if (!setting) {
            assertAlways(false, "Unknown setting: " + key);
        }
        if (!setting.validate(value)) {
            assertAlways(false, "Bad setting value: " + key);
        }
        this.getAllSettings()[key] = value;
        if (setting.changeCb) {
            setting.changeCb(this.app, value);
        }
        return this.writeAsync();
    }
    /**
     * Sets a new keybinding override
     */
    updateKeybindingOverride(keybindingId: string, keyCode: number): any {
        assert(Number.isInteger(keyCode), "Not a valid key code: " + keyCode);
        this.getAllSettings().keybindingOverrides[keybindingId] = keyCode;
        return this.writeAsync();
    }
    /**
     * Resets a given keybinding override
     */
    resetKeybindingOverride(id: string): any {
        delete this.getAllSettings().keybindingOverrides[id];
        return this.writeAsync();
    }
    /**
     * Resets all keybinding overrides
     */
    resetKeybindingOverrides(): any {
        this.getAllSettings().keybindingOverrides = {};
        return this.writeAsync();
    }
    // RW Proxy impl
    verify(data: any): any {
        if (!data.settings) {
            return ExplainedResult.bad("missing key 'settings'");
        }
        if (typeof data.settings !== "object") {
            return ExplainedResult.bad("Bad settings object");
        }
        // MODS
        if (!THEMES[data.settings.theme] || !this.app.restrictionMgr.getHasExtendedSettings()) {
            console.log("Resetting theme because its no longer available: " + data.settings.theme);
            data.settings.theme = "light";
        }
        const settings: any = data.settings;
        for (let i: any = 0; i < this.settingHandles.length; ++i) {
            const setting: any = this.settingHandles[i];
            const storedValue: any = settings[setting.id];
            if (!setting.validate(storedValue)) {
                return ExplainedResult.bad("Bad setting value for " +
                    setting.id +
                    ": " +
                    storedValue +
                    " @ settings version " +
                    data.version +
                    " (latest is " +
                    this.getCurrentVersion() +
                    ")");
            }
        }
        return ExplainedResult.good();
    }
    getDefaultData(): any {
        return {
            version: this.getCurrentVersion(),
            settings: new SettingsStorage(),
        };
    }
    getCurrentVersion(): any {
        return 32;
    }
        migrate(data: {
        settings: SettingsStorage;
        version: number;
    }): any {
        // Simply reset before
        if (data.version < 5) {
            data.settings = new SettingsStorage();
            data.version = this.getCurrentVersion();
            return ExplainedResult.good();
        }
        if (data.version < 6) {
            data.settings.alwaysMultiplace = false;
            data.version = 6;
        }
        if (data.version < 7) {
            data.settings.offerHints = true;
            data.version = 7;
        }
        if (data.version < 8) {
            data.settings.scrollWheelSensitivity = "regular";
            data.version = 8;
        }
        if (data.version < 9) {
            data.settings.language = "auto-detect";
            data.version = 9;
        }
        if (data.version < 10) {
            data.settings.movementSpeed = "regular";
            data.version = 10;
        }
        if (data.version < 11) {
            data.settings.enableTunnelSmartplace = true;
            data.version = 11;
        }
        if (data.version < 12) {
            data.settings.vignette = true;
            data.version = 12;
        }
        if (data.version < 13) {
            data.settings.compactBuildingInfo = false;
            data.version = 13;
        }
        if (data.version < 14) {
            data.settings.disableCutDeleteWarnings = false;
            data.version = 14;
        }
        if (data.version < 15) {
            data.settings.autosaveInterval = "two_minutes";
            data.version = 15;
        }
        if (data.version < 16) {
            // RE-ENABLE this setting, it already existed
            data.settings.enableTunnelSmartplace = true;
            data.version = 16;
        }
        if (data.version < 17) {
            data.settings.enableColorBlindHelper = false;
            data.version = 17;
        }
        if (data.version < 18) {
            data.settings.rotationByBuilding = true;
            data.version = 18;
        }
        if (data.version < 19) {
            data.settings.lowQualityMapResources = false;
            data.version = 19;
        }
        if (data.version < 20) {
            data.settings.disableTileGrid = false;
            data.version = 20;
        }
        if (data.version < 21) {
            data.settings.lowQualityTextures = false;
            data.version = 21;
        }
        if (data.version < 22) {
            data.settings.clearCursorOnDeleteWhilePlacing = true;
            data.version = 22;
        }
        if (data.version < 23) {
            data.settings.displayChunkBorders = false;
            data.version = 23;
        }
        if (data.version < 24) {
            data.settings.refreshRate = "60";
        }
        if (data.version < 25) {
            data.settings.musicVolume = 0.5;
            data.settings.soundVolume = 0.5;
            // @ts-ignore
            delete data.settings.musicMuted;
            // @ts-ignore
            delete data.settings.soundsMuted;
            data.version = 25;
        }
        if (data.version < 26) {
            data.settings.pickMinerOnPatch = true;
            data.version = 26;
        }
        if (data.version < 27) {
            data.settings.simplifiedBelts = false;
            data.version = 27;
        }
        if (data.version < 28) {
            data.settings.enableMousePan = true;
            data.version = 28;
        }
        if (data.version < 29) {
            data.settings.zoomToCursor = true;
            data.version = 29;
        }
        if (data.version < 30) {
            data.settings.mapResourcesScale = 0.5;
            // Re-enable hints as well
            data.settings.offerHints = true;
            data.version = 30;
        }
        if (data.version < 31) {
            data.settings.shapeTooltipAlwaysOn = false;
            data.version = 31;
        }
        if (data.version < 32) {
            data.version = 32;
        }
        // MODS
        if (!THEMES[data.settings.theme] || !this.app.restrictionMgr.getHasExtendedSettings()) {
            console.log("Resetting theme because its no longer available: " + data.settings.theme);
            data.settings.theme = "light";
        }
        return ExplainedResult.good();
    }
}
