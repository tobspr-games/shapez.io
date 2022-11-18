import { MusicInstanceInterface, SoundInstanceInterface, SoundInterface, MUSIC, SOUNDS } from "../sound";
import { cachebust } from "../../core/cachebust";
import { createLogger } from "../../core/logging";
import { globalConfig } from "../../core/config";
const { Howl, Howler }: any = require("howler");
const logger: any = createLogger("sound/browser");
// @ts-ignore
const sprites: any = require("../../built-temp/sfx.json");
class SoundSpritesContainer {
    public howl = null;
    public loadingPromise = null;

    constructor() {
    }
    load(): any {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        return (this.loadingPromise = new Promise((resolve: any): any => {
            this.howl = new Howl({
                src: cachebust("res/sounds/sfx.mp3"),
                sprite: sprites.sprite,
                autoplay: false,
                loop: false,
                volume: 0,
                preload: true,
                pool: 20,
                onload: (): any => {
                    resolve();
                },
                onloaderror: (id: any, err: any): any => {
                    logger.warn("SFX failed to load:", id, err);
                    this.howl = null;
                    resolve();
                },
                onplayerror: (id: any, err: any): any => {
                    logger.warn("SFX failed to play:", id, err);
                },
            });
        }));
    }
    play(volume: any, key: any): any {
        if (this.howl) {
            const instance: any = this.howl.play(key);
            this.howl.volume(volume, instance);
        }
    }
    deinitialize(): any {
        if (this.howl) {
            this.howl.unload();
            this.howl = null;
        }
    }
}
class WrappedSoundInstance extends SoundInstanceInterface {
    public spriteContainer = spriteContainer;

        constructor(spriteContainer, key) {
        super(key, "sfx.mp3");
    }
    /** {} */
    load(): Promise<void> {
        return this.spriteContainer.load();
    }
    play(volume: any): any {
        this.spriteContainer.play(volume, this.key);
    }
    deinitialize(): any {
        return this.spriteContainer.deinitialize();
    }
}
class MusicInstance extends MusicInstanceInterface {
    public howl = null;
    public instance = null;
    public playing = false;

    constructor(key, url) {
        super(key, url);
    }
    load(): any {
        return new Promise((resolve: any, reject: any): any => {
            this.howl = new Howl({
                src: cachebust("res/sounds/music/" + this.url + ".mp3"),
                autoplay: false,
                loop: true,
                html5: true,
                volume: 1,
                preload: true,
                pool: 2,
                onunlock: (): any => {
                    if (this.playing) {
                        logger.log("Playing music after manual unlock");
                        this.play();
                    }
                },
                onload: (): any => {
                    resolve();
                },
                onloaderror: (id: any, err: any): any => {
                    logger.warn(this, "Music", this.url, "failed to load:", id, err);
                    this.howl = null;
                    resolve();
                },
                onplayerror: (id: any, err: any): any => {
                    logger.warn(this, "Music", this.url, "failed to play:", id, err);
                },
            });
        });
    }
    stop(): any {
        if (this.howl && this.instance) {
            this.playing = false;
            this.howl.pause(this.instance);
        }
    }
    isPlaying(): any {
        return this.playing;
    }
    play(volume: any): any {
        if (this.howl) {
            this.playing = true;
            this.howl.volume(volume);
            if (this.instance) {
                this.howl.play(this.instance);
            }
            else {
                this.instance = this.howl.play();
            }
        }
    }
    setVolume(volume: any): any {
        if (this.howl) {
            this.howl.volume(volume);
        }
    }
    deinitialize(): any {
        if (this.howl) {
            this.howl.unload();
            this.howl = null;
            this.instance = null;
        }
    }
}
export class SoundImplBrowser extends SoundInterface {

    constructor(app) {
        Howler.mobileAutoEnable = true;
        Howler.autoUnlock = true;
        Howler.autoSuspend = false;
        Howler.html5PoolSize = 20;
        Howler.pos(0, 0, 0);
        super(app, WrappedSoundInstance, MusicInstance);
    }
    initialize(): any {
        // NOTICE: We override the initialize() method here with custom logic because
        // we have a sound sprites instance
        this.sfxHandle = new SoundSpritesContainer();
        // @ts-ignore
        const keys: any = Object.values(SOUNDS);
        keys.forEach((key: any): any => {
            this.sounds[key] = new WrappedSoundInstance(this.sfxHandle, key);
        });
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
    deinitialize(): any {
        return super.deinitialize().then((): any => Howler.unload());
    }
}
