/* typehints:start */
import type { Application } from "../application";
import type { Vector } from "../core/vector";
import type { GameRoot } from "../game/root";
/* typehints:end */
import { newEmptyMap, clamp } from "../core/utils";
import { createLogger } from "../core/logging";
import { globalConfig } from "../core/config";
const logger: any = createLogger("sound");
export const SOUNDS: any = {
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
    unlockUpgrade: "unlock_upgrade",
    tutorialStep: "tutorial_step",
};
export const MUSIC: any = {
    // The theme always depends on the standalone only, even if running the full
    // version in the browser
    theme: G_IS_STANDALONE ? "theme-full" : "theme-short",
};
if (G_IS_STANDALONE) {
    MUSIC.menu = "menu";
}
if (G_IS_STANDALONE) {
    MUSIC.puzzle = "puzzle-full";
}
export class SoundInstanceInterface {
    public key = key;
    public url = url;

    constructor(key, url) {
    }
    /** {} */
    load(): Promise<void> {
        abstract;
        return Promise.resolve();
    }
    play(volume: any): any {
        abstract;
    }
    deinitialize(): any { }
}
export class MusicInstanceInterface {
    public key = key;
    public url = url;

    constructor(key, url) {
    }
    stop(): any {
        abstract;
    }
    play(volume: any): any {
        abstract;
    }
    setVolume(volume: any): any {
        abstract;
    }
    /** {} */
    load(): Promise<void> {
        abstract;
        return Promise.resolve();
    }
    /** {} */
    isPlaying(): boolean {
        abstract;
        return false;
    }
    deinitialize(): any { }
}
export class SoundInterface {
    public app: Application = app;
    public soundClass = soundClass;
    public musicClass = musicClass;
    public sounds: {
        [idx: string]: SoundInstanceInterface;
    } = newEmptyMap();
    public music: {
        [idx: string]: MusicInstanceInterface;
    } = newEmptyMap();
    public currentMusic: MusicInstanceInterface = null;
    public pageIsVisible = true;
    public musicVolume = 1.0;
    public soundVolume = 1.0;

    constructor(app, soundClass, musicClass) {
    }
    /**
     * Initializes the sound
     * {}
     */
    initialize(): Promise<any> {
        for (const soundKey: any in SOUNDS) {
            const soundPath: any = SOUNDS[soundKey];
            const sound: any = new this.soundClass(soundKey, soundPath);
            this.sounds[soundPath] = sound;
        }
        for (const musicKey: any in MUSIC) {
            const musicPath: any = MUSIC[musicKey];
            const music: any = new this.musicClass(musicKey, musicPath);
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
     * {}
     */
    loadSound(key: string): Promise<void> {
        if (!key) {
            return Promise.resolve();
        }
        if (this.sounds[key]) {
            return this.sounds[key].load();
        }
        else if (this.music[key]) {
            return this.music[key].load();
        }
        else {
            logger.warn("Sound/Music by key not found:", key);
            return Promise.resolve();
        }
    }
    /** Deinits the sound
     * {}
     */
    deinitialize(): Promise<void> {
        const promises: any = [];
        for (const key: any in this.sounds) {
            promises.push(this.sounds[key].deinitialize());
        }
        for (const key: any in this.music) {
            promises.push(this.music[key].deinitialize());
        }
        // @ts-ignore
        return Promise.all(...promises);
    }
    /**
     * Returns the music volume
     * {}
     */
    getMusicVolume(): number {
        return this.musicVolume;
    }
    /**
     * Returns the sound volume
     * {}
     */
    getSoundVolume(): number {
        return this.soundVolume;
    }
    /**
     * Sets the music volume
     */
    setMusicVolume(volume: number): any {
        this.musicVolume = clamp(volume, 0, 1);
        if (this.currentMusic) {
            this.currentMusic.setVolume(this.musicVolume);
        }
    }
    /**
     * Sets the sound volume
     */
    setSoundVolume(volume: number): any {
        this.soundVolume = clamp(volume, 0, 1);
    }
    /**
     * Focus change handler, called by the pap
     */
    onPageRenderableStateChanged(pageIsVisible: boolean): any {
        this.pageIsVisible = pageIsVisible;
        if (this.currentMusic) {
            if (pageIsVisible) {
                if (!this.currentMusic.isPlaying()) {
                    this.currentMusic.play(this.musicVolume);
                }
            }
            else {
                this.currentMusic.stop();
            }
        }
    }
        playUiSound(key: string): any {
        if (!this.sounds[key]) {
            logger.warn("Sound", key, "not found, probably not loaded yet");
            return;
        }
        this.sounds[key].play(this.soundVolume);
    }
        play3DSound(key: string, worldPosition: Vector, root: GameRoot): any {
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
        let volume: any = this.soundVolume;
        if (!root.camera.isWorldPointOnScreen(worldPosition)) {
            volume = this.soundVolume / 5; // In the old implementation this value was fixed to 0.2 => 20% of 1.0
        }
        volume *= clamp(root.camera.zoomLevel / 3);
        this.sounds[key].play(clamp(volume));
    }
        playThemeMusic(key: string): any {
        const music: any = this.music[key];
        if (key && !music) {
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
