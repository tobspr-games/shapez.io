/* typehints:start */
import { Application } from "../application";
import { Vector } from "../core/vector";
import { GameRoot } from "../game/root";
/* typehints:end */

import { newEmptyMap, clamp } from "../core/utils";
import { createLogger } from "../core/logging";
import { globalConfig } from "../core/config";

const logger = createLogger("sound");

export const SOUNDS = {
    // Menu and such
    uiClick: "ui_click",
    uiError: "ui_error",
    dialogError: "dialog_error",
    dialogOk: "dialog_ok",
    swishHide: "ui_swish_hide",
    swishShow: "ui_swish_show",
    badgeNotification: "badge_notification",

    levelComplete: "level_complete",

    destroyBuilding: "destroy_building",
    placeBuilding: "place_building",
    placeBelt: "place_belt",
    copy: "copy",
};

export const MUSIC = {
    // The theme always depends on the standalone only, even if running the full
    // version in the browser
    theme: G_IS_STANDALONE ? "theme-full" : "theme-short",
    menu: "menu",
};

export class SoundInstanceInterface {
    constructor(key, url) {
        this.key = key;
        this.url = url;
    }

    /** @returns {Promise<void>} */
    load() {
        abstract;
        return Promise.resolve();
    }

    play(volume) {
        abstract;
    }

    deinitialize() {}
}

export class MusicInstanceInterface {
    constructor(key, url) {
        this.key = key;
        this.url = url;
    }

    stop() {
        abstract;
    }

    play(volume) {
        abstract;
    }

    setVolume(volume) {
        abstract;
    }

    /** @returns {Promise<void>} */
    load() {
        abstract;
        return Promise.resolve();
    }

    /** @returns {boolean} */
    isPlaying() {
        abstract;
        return false;
    }

    deinitialize() {}
}

export class SoundInterface {
    constructor(app, soundClass, musicClass) {
        /** @type {Application} */
        this.app = app;

        this.soundClass = soundClass;
        this.musicClass = musicClass;

        /** @type {Object<string, SoundInstanceInterface>} */
        this.sounds = newEmptyMap();

        /** @type {Object<string, MusicInstanceInterface>} */
        this.music = newEmptyMap();

        /** @type {MusicInstanceInterface} */
        this.currentMusic = null;

        this.pageIsVisible = true;

        this.musicVolume = 1.0;
        this.soundVolume = 1.0;
    }

    /**
     * Initializes the sound
     * @returns {Promise<any>}
     */
    initialize() {
        for (const soundKey in SOUNDS) {
            const soundPath = SOUNDS[soundKey];
            const sound = new this.soundClass(soundKey, soundPath);
            this.sounds[soundPath] = sound;
        }

        for (const musicKey in MUSIC) {
            const musicPath = MUSIC[musicKey];
            const music = new this.musicClass(musicKey, musicPath);
            this.music[musicPath] = music;
        }

        this.musicVolume = this.app.settings.getAllSettings().musicVolume;
        this.soundVolume = this.app.settings.getAllSettings().soundVolume;

        if (G_IS_DEV && globalConfig.debug.disableMusic) {
            this.musicVolume = 0.0;
        }

        return Promise.resolve();
    }

    /**
     * Pre-Loads the given sounds
     * @param {string} key
     * @returns {Promise<void>}
     */
    loadSound(key) {
        if (this.sounds[key]) {
            return this.sounds[key].load();
        } else if (this.music[key]) {
            return this.music[key].load();
        } else {
            logger.error("Sound/Music by key not found:", key);
            return Promise.resolve();
        }
    }

    /** Deinits the sound
     * @returns {Promise<void>}
     */
    deinitialize() {
        const promises = [];
        for (const key in this.sounds) {
            promises.push(this.sounds[key].deinitialize());
        }
        for (const key in this.music) {
            promises.push(this.music[key].deinitialize());
        }
        // @ts-ignore
        return Promise.all(...promises);
    }

    /**
     * Returns the music volume
     * @returns {number}
     */
    getMusicVolume() {
        return this.musicVolume;
    }

    /**
     * Returns the sound volume
     * @returns {number}
     */
    getSoundVolume() {
        return this.soundVolume;
    }

    /**
     * Sets the music volume
     * @param {number} volume
     */
    setMusicVolume(volume) {
        this.musicVolume = clamp(volume, 0, 1);
        if (this.currentMusic) {
            this.currentMusic.setVolume(this.musicVolume);
        }
    }

    /**
     * Sets the sound volume
     * @param {number} volume
     */
    setSoundVolume(volume) {
        this.soundVolume = clamp(volume, 0, 1);
    }

    /**
     * Focus change handler, called by the pap
     * @param {boolean} pageIsVisible
     */
    onPageRenderableStateChanged(pageIsVisible) {
        this.pageIsVisible = pageIsVisible;
        if (this.currentMusic) {
            if (pageIsVisible) {
                if (!this.currentMusic.isPlaying()) {
                    this.currentMusic.play(this.musicVolume);
                }
            } else {
                this.currentMusic.stop();
            }
        }
    }

    /**
     * @param {string} key
     */
    playUiSound(key) {
        if (!this.sounds[key]) {
            logger.warn("Sound", key, "not found, probably not loaded yet");
            return;
        }
        this.sounds[key].play(this.soundVolume);
    }

    /**
     *
     * @param {string} key
     * @param {Vector} worldPosition
     * @param {GameRoot} root
     */
    play3DSound(key, worldPosition, root) {
        if (!this.sounds[key]) {
            logger.warn("Music", key, "not found, probably not loaded yet");
            return;
        }
        if (!this.pageIsVisible) {
            return;
        }

        // hack, but works
        if (root.time.getIsPaused()) {
            return;
        }

        let volume = this.soundVolume;
        if (!root.camera.isWorldPointOnScreen(worldPosition)) {
            volume = this.soundVolume / 5; // In the old implementation this value was fixed to 0.2 => 20% of 1.0
        }
        volume *= clamp(root.camera.zoomLevel / 3);
        this.sounds[key].play(clamp(volume));
    }

    /**
     * @param {string} key
     */
    playThemeMusic(key) {
        const music = this.music[key];
        if (key !== null && !music) {
            logger.warn("Music", key, "not found");
        }
        if (this.currentMusic !== music) {
            if (this.currentMusic) {
                logger.log("Stopping", this.currentMusic.key);
                this.currentMusic.stop();
            }
            this.currentMusic = music;
            if (music && this.pageIsVisible) {
                logger.log("Starting", this.currentMusic.key);
                music.play(this.musicVolume);
            }
        }
    }
}
