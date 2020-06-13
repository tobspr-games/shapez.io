/* typehints:start */
import { Application } from "../application";
/* typehints:end */

import { ReadWriteProxy } from "../core/read_write_proxy";
import { BoolSetting, EnumSetting, BaseSetting } from "./setting_types";
import { createLogger } from "../core/logging";
import { ExplainedResult } from "../core/explained_result";
import { THEMES, THEME, applyGameTheme } from "../game/theme";
import { IS_DEMO } from "../core/config";
import { T } from "../translations";
import { LANGUAGES } from "../languages";

const logger = createLogger("application_settings");

const categoryGame = "game";
const categoryApp = "app";

export const uiScales = [
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

export const scrollWheelSensitivities = [
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

export const movementSpeeds = [
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

/** @type {Array<BaseSetting>} */
export const allApplicationSettings = [
    new EnumSetting("language", {
        options: Object.keys(LANGUAGES),
        valueGetter: key => key,
        textGetter: key => LANGUAGES[key].name,
        category: categoryApp,
        restartRequired: true,
        changeCb: (app, id) => null,
        magicValue: "auto-detect",
    }),

    new EnumSetting("uiScale", {
        options: uiScales.sort((a, b) => a.size - b.size),
        valueGetter: scale => scale.id,
        textGetter: scale => T.settings.labels.uiScale.scales[scale.id],
        category: categoryApp,
        restartRequired: false,
        changeCb:
            /**
             * @param {Application} app
             */
            (app, id) => app.updateAfterUiScaleChanged(),
    }),

    new BoolSetting(
        "fullscreen",
        categoryApp,
        /**
         * @param {Application} app
         */
        (app, value) => {
            if (app.platformWrapper.getSupportsFullscreen()) {
                app.platformWrapper.setFullscreen(value);
            }
        },
        !IS_DEMO
    ),

    new BoolSetting(
        "soundsMuted",
        categoryApp,
        /**
         * @param {Application} app
         */
        (app, value) => app.sound.setSoundsMuted(value)
    ),
    new BoolSetting(
        "musicMuted",
        categoryApp,
        /**
         * @param {Application} app
         */
        (app, value) => app.sound.setMusicMuted(value)
    ),

    // GAME

    new EnumSetting("theme", {
        options: Object.keys(THEMES),
        valueGetter: theme => theme,
        textGetter: theme => T.settings.labels.theme.themes[theme],
        category: categoryGame,
        restartRequired: false,
        changeCb:
            /**
             * @param {Application} app
             */
            (app, id) => {
                applyGameTheme(id);
                document.body.setAttribute("data-theme", id);
            },
        enabled: !IS_DEMO,
    }),

    new EnumSetting("refreshRate", {
        options: ["60", "100", "144", "165", "250", "500"],
        valueGetter: rate => rate,
        textGetter: rate => rate + " Hz",
        category: categoryGame,
        restartRequired: false,
        changeCb: (app, id) => {},
        enabled: !IS_DEMO,
    }),

    new EnumSetting("scrollWheelSensitivity", {
        options: scrollWheelSensitivities.sort((a, b) => a.scale - b.scale),
        valueGetter: scale => scale.id,
        textGetter: scale => T.settings.labels.scrollWheelSensitivity.sensitivity[scale.id],
        category: categoryGame,
        restartRequired: false,
        changeCb:
            /**
             * @param {Application} app
             */
            (app, id) => app.updateAfterUiScaleChanged(),
    }),

    new EnumSetting("movementSpeed", {
        options: movementSpeeds.sort((a, b) => a.multiplier - b.multiplier),
        valueGetter: multiplier => multiplier.id,
        textGetter: multiplier => T.settings.labels.movementSpeed.speeds[multiplier.id],
        category: categoryGame,
        restartRequired: false,
        changeCb: (app, id) => {},
    }),

    new BoolSetting("alwaysMultiplace", categoryGame, (app, value) => {}),
    new BoolSetting("offerHints", categoryGame, (app, value) => {}),
];

export function getApplicationSettingById(id) {
    return allApplicationSettings.find(setting => setting.id === id);
}

class SettingsStorage {
    constructor() {
        this.uiScale = "regular";
        this.fullscreen = G_IS_STANDALONE;

        this.soundsMuted = false;
        this.musicMuted = false;
        this.theme = "light";
        this.refreshRate = "60";
        this.scrollWheelSensitivity = "regular";
        this.movementSpeed = "regular";
        this.language = "auto-detect";

        this.alwaysMultiplace = false;
        this.offerHints = true;

        /**
         * @type {Object.<string, number>}
         */
        this.keybindingOverrides = {};
    }
}

export class ApplicationSettings extends ReadWriteProxy {
    constructor(app) {
        super(app, "app_settings.bin");
    }

    initialize() {
        // Read and directly write latest data back
        return this.readAsync()
            .then(() => {
                // Apply default setting callbacks
                const settings = this.getAllSettings();
                for (let i = 0; i < allApplicationSettings.length; ++i) {
                    const handle = allApplicationSettings[i];
                    handle.apply(this.app, settings[handle.id]);
                }
            })

            .then(() => this.writeAsync());
    }

    save() {
        return this.writeAsync();
    }

    // Getters

    /**
     * @returns {SettingsStorage}
     */
    getAllSettings() {
        return this.getCurrentData().settings;
    }

    /**
     * @param {string} key
     */
    getSetting(key) {
        assert(this.getAllSettings().hasOwnProperty(key), "Setting not known: " + key);
        return this.getAllSettings()[key];
    }

    getInterfaceScaleId() {
        if (!this.currentData) {
            // Not initialized yet
            return "regular";
        }
        return this.getAllSettings().uiScale;
    }

    getDesiredFps() {
        return parseInt(this.getAllSettings().refreshRate);
    }

    getInterfaceScaleValue() {
        const id = this.getInterfaceScaleId();
        for (let i = 0; i < uiScales.length; ++i) {
            if (uiScales[i].id === id) {
                return uiScales[i].size;
            }
        }
        logger.error("Unknown ui scale id:", id);
        return 1;
    }

    getScrollWheelSensitivity() {
        const id = this.getAllSettings().scrollWheelSensitivity;
        for (let i = 0; i < scrollWheelSensitivities.length; ++i) {
            if (scrollWheelSensitivities[i].id === id) {
                return scrollWheelSensitivities[i].scale;
            }
        }
        logger.error("Unknown scroll wheel sensitivity id:", id);
        return 1;
    }

    getMovementSpeed() {
        const id = this.getAllSettings().movementSpeed;
        for (let i = 0; i < movementSpeeds.length; ++i) {
            if (movementSpeeds[i].id === id) {
                return movementSpeeds[i].multiplier;
            }
        }
        logger.error("Unknown movement speed id:", id);
        return 1;
    }

    getIsFullScreen() {
        return this.getAllSettings().fullscreen;
    }

    getKeybindingOverrides() {
        return this.getAllSettings().keybindingOverrides;
    }

    getLanguage() {
        return this.getAllSettings().language;
    }

    // Setters

    updateLanguage(id) {
        assert(LANGUAGES[id], "Language not known: " + id);
        return this.updateSetting("language", id);
    }

    /**
     * @param {string} key
     * @param {string|boolean} value
     */
    updateSetting(key, value) {
        for (let i = 0; i < allApplicationSettings.length; ++i) {
            const setting = allApplicationSettings[i];
            if (setting.id === key) {
                if (!setting.validate(value)) {
                    assertAlways(false, "Bad setting value: " + key);
                }
                this.getAllSettings()[key] = value;
                if (setting.changeCb) {
                    setting.changeCb(this.app, value);
                }
                return this.writeAsync();
            }
        }
        assertAlways(false, "Unknown setting: " + key);
    }

    /**
     * Sets a new keybinding override
     * @param {string} keybindingId
     * @param {number} keyCode
     */
    updateKeybindingOverride(keybindingId, keyCode) {
        assert(Number.isInteger(keyCode), "Not a valid key code: " + keyCode);
        this.getAllSettings().keybindingOverrides[keybindingId] = keyCode;
        return this.writeAsync();
    }

    /**
     * Resets a given keybinding override
     * @param {string} id
     */
    resetKeybindingOverride(id) {
        delete this.getAllSettings().keybindingOverrides[id];
        return this.writeAsync();
    }
    /**
     * Resets all keybinding overrides
     */
    resetKeybindingOverrides() {
        this.getAllSettings().keybindingOverrides = {};
        return this.writeAsync();
    }

    // RW Proxy impl
    verify(data) {
        if (!data.settings) {
            return ExplainedResult.bad("missing key 'settings'");
        }
        if (typeof data.settings !== "object") {
            return ExplainedResult.bad("Bad settings object");
        }

        const settings = data.settings;
        for (let i = 0; i < allApplicationSettings.length; ++i) {
            const setting = allApplicationSettings[i];
            const storedValue = settings[setting.id];
            if (!setting.validate(storedValue)) {
                return ExplainedResult.bad("Bad setting value for " + setting.id + ": " + storedValue);
            }
        }
        return ExplainedResult.good();
    }

    getDefaultData() {
        return {
            version: this.getCurrentVersion(),
            settings: new SettingsStorage(),
        };
    }

    getCurrentVersion() {
        return 10;
    }

    /** @param {{settings: SettingsStorage, version: number}} data */
    migrate(data) {
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

        return ExplainedResult.good();
    }
}
